from rest_framework import serializers
from .models import ProductCategory, Product, ProductReview, Order, OrderItem, CartItem
from farmers.serializers import FarmerSerializer

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

class ProductReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.ReadOnlyField(source='reviewer.username')
    
    class Meta:
        model = ProductReview
        fields = ('id', 'product', 'reviewer', 'reviewer_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('reviewer',)

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    farmer_name = serializers.ReadOnlyField(source='farmer.farm_name')
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'farmer', 'farmer_name', 'category', 'category_name', 
                  'description', 'price', 'stock_quantity', 'unit', 'image', 
                  'is_organic', 'is_available', 'created_at', 'updated_at')

class ProductDetailSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    farmer = FarmerSerializer(read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'farmer', 'category', 'description', 'price', 
                  'stock_quantity', 'unit', 'image', 'is_organic', 'is_available', 
                  'created_at', 'updated_at', 'reviews')

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ('id', 'order', 'product', 'product_name', 'quantity', 'price', 'subtotal')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source='customer.username')
    
    class Meta:
        model = Order
        fields = ('id', 'customer', 'customer_name', 'order_date', 'status', 
                  'shipping_address', 'contact_phone', 'total_amount', 
                  'payment_method', 'payment_status', 'notes', 'items')
        read_only_fields = ('customer',)

class CreateOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('product', 'quantity')

class CreateOrderSerializer(serializers.ModelSerializer):
    items = CreateOrderItemSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = ('shipping_address', 'contact_phone', 'payment_method', 'notes', 'items')
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        total_amount = 0
        
        # Calculate total amount and verify stock
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            if product.stock_quantity < quantity:
                raise serializers.ValidationError(f"Not enough stock for {product.name}")
            
            total_amount += product.price * quantity
        
        # Create order
        order = Order.objects.create(
            customer=self.context['request'].user,
            total_amount=total_amount,
            **validated_data
        )
        
        # Create order items and update stock
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )
            
            # Update product stock
            product.stock_quantity -= quantity
            product.save()
        
        return order

class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = ('id', 'user', 'product', 'product_details', 'quantity', 'subtotal', 'added_at')
        read_only_fields = ('user',)

class AddToCartSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ('product', 'quantity')
        
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1")
        return value
    
    def validate(self, data):
        product = data['product']
        quantity = data['quantity']
        
        if product.stock_quantity < quantity:
            raise serializers.ValidationError(f"Not enough stock available. Only {product.stock_quantity} units left.")
        
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data['quantity']
        
        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity}
        )
        
        # If item already existed, update quantity
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return cart_item
