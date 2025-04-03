from rest_framework import viewsets, permissions, generics, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ProductCategory, Product, ProductReview, Order, OrderItem, CartItem
from .serializers import (
    ProductCategorySerializer,
    ProductSerializer,
    ProductDetailSerializer,
    ProductReviewSerializer,
    OrderSerializer,
    CreateOrderSerializer,
    CartItemSerializer,
    AddToCartSerializer
)
from farmers.views import IsFarmerOrReadOnly

class IsProductFarmerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow farmers who created the product to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the farmer who owns the product
        return obj.farmer.user == request.user

class ProductCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing product categories"""
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for managing products"""
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsProductFarmerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'farmer', 'is_organic']
    search_fields = ['name', 'description', 'farmer__farm_name']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        # Automatically set the farmer to the current user's farmer profile
        farmer = self.request.user.farmer_profile
        serializer.save(farmer=farmer)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_review(self, request, pk=None):
        product = self.get_object()
        # Farmers can't review their own products
        if product.farmer.user == request.user:
            return Response({"error": "You cannot review your own product"}, status=400)
        
        # Check if user has already reviewed this product
        existing_review = ProductReview.objects.filter(product=product, reviewer=request.user).first()
        
        if existing_review:
            serializer = ProductReviewSerializer(existing_review, data=request.data)
        else:
            serializer = ProductReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product, reviewer=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing orders"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'payment_status']
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'farmer':
            # Farmers see orders that include their products
            farmer = user.farmer_profile
            return Order.objects.filter(items__product__farmer=farmer).distinct()
        # Consumers see their own orders
        return Order.objects.filter(customer=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for managing shopping cart"""
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own cart
        return CartItem.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        serializer = AddToCartSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            cart_item = serializer.save()
            return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        # Get all cart items for the user
        cart_items = CartItem.objects.filter(user=request.user)
        
        if not cart_items.exists():
            return Response({"error": "Your cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if shipping address and contact are provided
        shipping_address = request.data.get('shipping_address')
        contact_phone = request.data.get('contact_phone')
        payment_method = request.data.get('payment_method')
        notes = request.data.get('notes', '')
        
        if not shipping_address or not contact_phone or not payment_method:
            return Response({
                "error": "Shipping address, contact phone, and payment method are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create order data
        order_data = {
            'customer': request.user,
            'shipping_address': shipping_address,
            'contact_phone': contact_phone,
            'payment_method': payment_method,
            'notes': notes,
            'total_amount': sum(item.subtotal for item in cart_items)
        }
        
        # Create order
        order = Order.objects.create(**order_data)
        
        # Create order items and update product stock
        for cart_item in cart_items:
            product = cart_item.product
            quantity = cart_item.quantity
            
            # Check if still in stock
            if product.stock_quantity < quantity:
                order.delete()  # Roll back order creation
                return Response({
                    "error": f"Not enough stock available for {product.name}. Only {product.stock_quantity} units left."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create order item
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )
            
            # Update product stock
            product.stock_quantity -= quantity
            product.save()
        
        # Clear cart after successful checkout
        cart_items.delete()
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        # Clear all items from user's cart
        cart_items = CartItem.objects.filter(user=request.user)
        count = cart_items.count()
        cart_items.delete()
        
        return Response({"message": f"Removed {count} items from your cart"}, status=status.HTTP_200_OK)
