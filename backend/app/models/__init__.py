"""Pydantic models for Amazon Clone."""

from app.models.ads import AdCampaign, AdCampaignCreate, AdCampaignUpdate, AdEvent, AdSpendDaily, Advertiser
from app.models.cart import Cart, CartItem, CartItemCreate, CartItemUpdate
from app.models.order import Address, Order, OrderCreate, OrderItem
from app.models.product import Category, CategoryCreate, Product, ProductCreate, ProductUpdate
from app.models.review import Review, ReviewCreate
from app.models.user import Seller, SellerCreate, User
from app.models.wishlist import Wishlist, WishlistItem, WishlistItemCreate

__all__ = [
    # Products & Categories
    "Product",
    "ProductCreate",
    "ProductUpdate",
    "Category",
    "CategoryCreate",
    # Users & Sellers
    "User",
    "Seller",
    "SellerCreate",
    # Cart
    "Cart",
    "CartItem",
    "CartItemCreate",
    "CartItemUpdate",
    # Orders
    "Order",
    "OrderCreate",
    "OrderItem",
    "Address",
    # Reviews
    "Review",
    "ReviewCreate",
    # Wishlist
    "Wishlist",
    "WishlistItem",
    "WishlistItemCreate",
    # Ads
    "Advertiser",
    "AdCampaign",
    "AdCampaignCreate",
    "AdCampaignUpdate",
    "AdEvent",
    "AdSpendDaily",
]
