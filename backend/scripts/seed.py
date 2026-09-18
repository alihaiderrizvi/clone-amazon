#!/usr/bin/env python3
"""Seed script to populate the database with demo data."""

import asyncio
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add the backend directory to sys.path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

import certifi
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings

# =============================================================================
# SEED DATA
# =============================================================================

SELLERS = [
    {
        "id": "seller_techzone",
        "userId": "user_techzone",
        "storeName": "TechZone Electronics",
        "displayName": "TechZone",
        "contactEmail": "support@techzone.example.com",
    },
    {
        "id": "seller_homehaven",
        "userId": "user_homehaven",
        "storeName": "Home Haven Supplies",
        "displayName": "Home Haven",
        "contactEmail": "hello@homehaven.example.com",
    },
    {
        "id": "seller_bookworm",
        "userId": "user_bookworm",
        "storeName": "Bookworm Books & Media",
        "displayName": "Bookworm",
        "contactEmail": "orders@bookworm.example.com",
    },
    {
        "id": "seller_sportspro",
        "userId": "user_sportspro",
        "storeName": "SportsPro Athletic Gear",
        "displayName": "SportsPro",
        "contactEmail": "team@sportspro.example.com",
    },
    {
        "id": "seller_glamour",
        "userId": "user_glamour",
        "storeName": "Glamour Beauty & Style",
        "displayName": "Glamour",
        "contactEmail": "care@glamour.example.com",
    },
]

CATEGORIES = [
    {"id": "cat_electronics", "slug": "electronics", "name": "Electronics", "parentId": None, "sortOrder": 1},
    {"id": "cat_computers", "slug": "computers", "name": "Computers", "parentId": None, "sortOrder": 2},
    {"id": "cat_home", "slug": "home-kitchen", "name": "Home & Kitchen", "parentId": None, "sortOrder": 3},
    {"id": "cat_books", "slug": "books", "name": "Books", "parentId": None, "sortOrder": 4},
    {"id": "cat_clothing", "slug": "clothing", "name": "Clothing", "parentId": None, "sortOrder": 5},
    {"id": "cat_sports", "slug": "sports-outdoors", "name": "Sports & Outdoors", "parentId": None, "sortOrder": 6},
    {"id": "cat_beauty", "slug": "beauty", "name": "Beauty", "parentId": None, "sortOrder": 7},
    {"id": "cat_toys", "slug": "toys-games", "name": "Toys & Games", "parentId": None, "sortOrder": 8},
]

# Products organized by category with realistic data
PRODUCTS_DATA = {
    "cat_electronics": [
        {
            "slug": "wireless-noise-cancelling-headphones",
            "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            "brand": "Sony",
            "priceCents": 34999,
            "listPriceCents": 39999,
            "bullets": [
                "Industry-leading noise cancellation with Auto NC Optimizer",
                "Exceptional sound quality with 30mm drivers",
                "30-hour battery life with quick charging",
                "Crystal-clear hands-free calling with 4 beamforming microphones",
                "Multipoint connection for seamless device switching"
            ],
            "description": "Experience the next level of silence with Sony WH-1000XM5. Our best-ever noise canceling headphones feature Auto NC Optimizer that automatically optimizes noise canceling based on your wearing conditions and environment.",
            "attributes": {"color": "Black", "connectivity": "Bluetooth 5.2", "weight": "250g"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "apple-airpods-pro-2nd-gen",
            "title": "Apple AirPods Pro (2nd Generation) with MagSafe Charging Case",
            "brand": "Apple",
            "priceCents": 24999,
            "listPriceCents": 24999,
            "bullets": [
                "Active Noise Cancellation reduces unwanted background noise",
                "Adaptive Transparency lets outside sounds in while reducing loud noise",
                "Personalized Spatial Audio with dynamic head tracking",
                "MagSafe Charging Case with speaker and lanyard loop",
                "Touch control lets you adjust volume with a swipe"
            ],
            "description": "AirPods Pro feature up to 2x more Active Noise Cancellation, plus Adaptive Transparency, and Personalized Spatial Audio with dynamic head tracking for immersive sound.",
            "attributes": {"color": "White", "connectivity": "Bluetooth 5.3", "chipset": "H2"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "samsung-65-inch-4k-smart-tv",
            "title": "Samsung 65-Inch Class Crystal UHD 4K Smart TV",
            "brand": "Samsung",
            "priceCents": 54799,
            "listPriceCents": 64999,
            "bullets": [
                "Crystal Processor 4K delivers stunning clarity and color",
                "PurColor provides a vivid spectrum of accurate colors",
                "Smart TV with built-in voice assistants",
                "Motion Xcelerator enhances motion clarity",
                "Object Tracking Sound Lite for immersive audio"
            ],
            "description": "Discover a crystal clear world of entertainment. The Crystal Processor 4K uses powerful AI upscaling to transform everything you watch into 4K resolution.",
            "attributes": {"screenSize": "65 inches", "resolution": "4K UHD", "smartTV": "Yes"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "iphone-15-pro-max-256gb",
            "title": "Apple iPhone 15 Pro Max - 256GB - Natural Titanium",
            "brand": "Apple",
            "priceCents": 119900,
            "listPriceCents": 119900,
            "bullets": [
                "6.7-inch Super Retina XDR display with ProMotion",
                "A17 Pro chip with 6-core GPU",
                "48MP main camera with advanced computational photography",
                "Titanium design with Ceramic Shield front",
                "Action button for quick access to your favorite features"
            ],
            "description": "iPhone 15 Pro Max. Forged in titanium with the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
            "attributes": {"storage": "256GB", "color": "Natural Titanium", "display": "6.7 inch"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "jbl-flip-6-portable-speaker",
            "title": "JBL Flip 6 Portable Bluetooth Speaker with IP67 Waterproof",
            "brand": "JBL",
            "priceCents": 12995,
            "listPriceCents": 12995,
            "bullets": [
                "Powerful JBL Original Pro Sound",
                "IP67 waterproof and dustproof rating",
                "12 hours of playtime on a single charge",
                "PartyBoost feature for pairing multiple speakers",
                "Eco-friendly packaging from recycled materials"
            ],
            "description": "Loud highs, and deep bass, Flip 6's 2-way speaker system features an optimized racetrack-shaped woofer and separate tweeter to deliver crisp, clear and punchy sound.",
            "attributes": {"color": "Black", "batteryLife": "12 hours", "waterproof": "IP67"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "kindle-paperwhite-11th-gen",
            "title": "Kindle Paperwhite (11th Gen) - 6.8\" Display, 8GB, Adjustable Warm Light",
            "brand": "Amazon",
            "priceCents": 13999,
            "listPriceCents": 15999,
            "bullets": [
                "6.8\" glare-free display with 300 ppi",
                "Adjustable warm light for comfortable reading day and night",
                "Waterproof (IPX8) for reading in the bath or by the pool",
                "Up to 10 weeks of battery life",
                "20% faster page turns than previous generation"
            ],
            "description": "The Kindle Paperwhite features a 6.8\" display with thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns than the previous generation.",
            "attributes": {"storage": "8GB", "display": "6.8 inch", "waterproof": "IPX8"},
            "sellerId": "seller_bookworm",
        },
    ],
    "cat_computers": [
        {
            "slug": "macbook-pro-14-m3-pro",
            "title": "Apple MacBook Pro 14\" with M3 Pro Chip - 18GB RAM, 512GB SSD",
            "brand": "Apple",
            "priceCents": 199900,
            "listPriceCents": 199900,
            "bullets": [
                "Apple M3 Pro chip with 11-core CPU and 14-core GPU",
                "18GB unified memory for smooth multitasking",
                "14.2\" Liquid Retina XDR display",
                "Up to 17 hours of battery life",
                "Space Black or Silver finish"
            ],
            "description": "MacBook Pro with M3 Pro takes its power and efficiency further than ever. It delivers exceptional performance for demanding workflows like manipulating gigapixel panoramas.",
            "attributes": {"processor": "M3 Pro", "ram": "18GB", "storage": "512GB SSD"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "dell-xps-15-laptop",
            "title": "Dell XPS 15 Laptop - 13th Gen Intel Core i7, 16GB RAM, 512GB SSD",
            "brand": "Dell",
            "priceCents": 149999,
            "listPriceCents": 169999,
            "bullets": [
                "13th Gen Intel Core i7-13700H processor",
                "15.6\" OLED 3.5K display with 400-nit brightness",
                "16GB DDR5 RAM and 512GB PCIe SSD",
                "NVIDIA GeForce RTX 4050 graphics",
                "Stunning InfinityEdge display design"
            ],
            "description": "The Dell XPS 15 combines stunning aesthetics with incredible performance. The OLED display delivers exceptional contrast and vivid colors for an immersive visual experience.",
            "attributes": {"processor": "Intel Core i7-13700H", "ram": "16GB DDR5", "graphics": "RTX 4050"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "logitech-mx-master-3s",
            "title": "Logitech MX Master 3S Wireless Performance Mouse",
            "brand": "Logitech",
            "priceCents": 9999,
            "listPriceCents": 9999,
            "bullets": [
                "8K DPI tracking on any surface, including glass",
                "Quiet Clicks with 90% less click noise",
                "MagSpeed Electromagnetic scrolling - 1000 lines per second",
                "USB-C quick charging - 3 hours from 1 minute charge",
                "Connect up to 3 devices with Easy-Switch"
            ],
            "description": "Logitech MX Master 3S is a flagship wireless mouse with next-gen performance. Features quiet clicks and 8K DPI any-surface tracking for ultimate precision.",
            "attributes": {"color": "Graphite", "connectivity": "Bluetooth + USB receiver", "sensor": "8000 DPI"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "mechanical-gaming-keyboard",
            "title": "SteelSeries Apex Pro TKL Wireless Mechanical Gaming Keyboard",
            "brand": "SteelSeries",
            "priceCents": 22999,
            "listPriceCents": 24999,
            "bullets": [
                "OmniPoint 2.0 adjustable switches (0.2mm-3.8mm actuation)",
                "2.4GHz wireless and Bluetooth 5.0 connectivity",
                "40+ hour battery life with RGB lighting",
                "Aircraft-grade aluminum frame",
                "Per-key RGB illumination with 16.8 million colors"
            ],
            "description": "The world's fastest keyboard is now wireless. Apex Pro TKL Wireless features adjustable OmniPoint switches with 0.2mm actuation for unprecedented speed and responsiveness.",
            "attributes": {"layout": "TKL", "switches": "OmniPoint 2.0", "connectivity": "Wireless + Bluetooth"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "samsung-32-curved-monitor",
            "title": "Samsung 32\" Odyssey G5 Curved Gaming Monitor 165Hz",
            "brand": "Samsung",
            "priceCents": 29999,
            "listPriceCents": 34999,
            "bullets": [
                "32\" QHD (2560x1440) curved display",
                "165Hz refresh rate with 1ms response time",
                "1000R curvature matches the human eye",
                "AMD FreeSync Premium for smooth gameplay",
                "HDR10 support for enhanced contrast"
            ],
            "description": "Dive into action with the 1000R curved display that matches the curvature of the human eye for maximum immersion and minimum eye strain.",
            "attributes": {"size": "32 inch", "resolution": "2560x1440", "refreshRate": "165Hz"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "webcam-4k-streaming",
            "title": "Elgato Facecam Pro 4K60 Webcam for Streaming and Video Calls",
            "brand": "Elgato",
            "priceCents": 29999,
            "listPriceCents": 29999,
            "bullets": [
                "4K resolution at 60fps for ultra-sharp video",
                "Sony STARVIS sensor for exceptional low-light performance",
                "Adjustable field of view from 90° to 75°",
                "Advanced image processing with f/2.0 aperture",
                "USB-C connectivity with included cable"
            ],
            "description": "Elgato Facecam Pro delivers true 4K60 video quality with a professional Sony sensor. Perfect for streaming, recording, and video conferencing.",
            "attributes": {"resolution": "4K60", "sensor": "Sony STARVIS", "fov": "90°"},
            "sellerId": "seller_techzone",
        },
    ],
    "cat_home": [
        {
            "slug": "instant-pot-duo-7-in-1",
            "title": "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart",
            "brand": "Instant Pot",
            "priceCents": 8995,
            "listPriceCents": 9999,
            "bullets": [
                "7-in-1 functionality: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer",
                "6-quart capacity perfect for families of 6 or more",
                "13 customizable Smart Programs for one-touch cooking",
                "Stainless steel inner pot is dishwasher safe",
                "10+ proven safety mechanisms"
            ],
            "description": "The Instant Pot Duo is the #1 selling multi-cooker, designed to be safe, convenient and dependable. It speeds up cooking by 2-6 times using up to 70% less energy.",
            "attributes": {"capacity": "6 Quart", "programs": "13", "material": "Stainless Steel"},
            "sellerId": "seller_homehaven",
        },
        {
            "slug": "dyson-v15-detect-vacuum",
            "title": "Dyson V15 Detect Cordless Vacuum Cleaner",
            "brand": "Dyson",
            "priceCents": 74999,
            "listPriceCents": 74999,
            "bullets": [
                "Laser reveals microscopic dust on hard floors",
                "Piezo sensor counts and sizes dust particles",
                "Up to 60 minutes of fade-free power",
                "LCD screen shows scientific proof of a deep clean",
                "Whole-machine HEPA filtration"
            ],
            "description": "The Dyson V15 Detect reveals invisible dust with a precisely-angled laser. An acoustic piezo sensor automatically adapts suction based on dust concentration.",
            "attributes": {"runtime": "60 minutes", "filtration": "HEPA", "display": "LCD"},
            "sellerId": "seller_homehaven",
        },
        {
            "slug": "ninja-professional-blender",
            "title": "Ninja Professional Plus Blender with Auto-iQ",
            "brand": "Ninja",
            "priceCents": 11999,
            "listPriceCents": 12999,
            "bullets": [
                "1400-peak-watt motor for powerful ice crushing",
                "72 oz. Total Crushing Pitcher with lid",
                "Auto-iQ Technology with one-touch blending programs",
                "Dishwasher-safe parts for easy cleanup",
                "BPA-free pitcher and cups"
            ],
            "description": "The Ninja Professional Plus Blender delivers high-performance blending with a powerful motor and Auto-iQ technology for intelligently timed blending.",
            "attributes": {"power": "1400W peak", "capacity": "72 oz", "programs": "Auto-iQ"},
            "sellerId": "seller_homehaven",
        },
        {
            "slug": "keurig-k-elite-coffee-maker",
            "title": "Keurig K-Elite Single Serve K-Cup Pod Coffee Maker",
            "brand": "Keurig",
            "priceCents": 18999,
            "listPriceCents": 18999,
            "bullets": [
                "Strong Brew button for bolder coffee taste",
                "Iced setting for refreshing iced beverages",
                "5 cup sizes: 4, 6, 8, 10, and 12 oz",
                "Large 75 oz. water reservoir",
                "Programmable auto on/off feature"
            ],
            "description": "The Keurig K-Elite combines a premium finish and programmable features to deliver a delicious cup every time. Brew hot or over ice at the push of a button.",
            "attributes": {"reservoir": "75 oz", "cupSizes": "5", "color": "Brushed Silver"},
            "sellerId": "seller_homehaven",
        },
        {
            "slug": "philips-smart-led-bulbs-4pack",
            "title": "Philips Hue White and Color Ambiance Smart LED Bulbs (4-Pack)",
            "brand": "Philips",
            "priceCents": 17999,
            "listPriceCents": 19999,
            "bullets": [
                "16 million colors and shades of white light",
                "Voice control with Alexa, Google Assistant, and Apple HomeKit",
                "Set schedules, timers, and automations",
                "No hub required for basic features",
                "Energy-efficient LED technology"
            ],
            "description": "Transform your home with smart lighting. Philips Hue smart bulbs let you control your lights from anywhere and create the perfect ambiance for any occasion.",
            "attributes": {"colors": "16 million", "wattage": "9W equivalent", "connectivity": "Bluetooth + Hub"},
            "sellerId": "seller_homehaven",
        },
        {
            "slug": "roomba-j7-robot-vacuum",
            "title": "iRobot Roomba j7+ Self-Emptying Robot Vacuum",
            "brand": "iRobot",
            "priceCents": 79999,
            "listPriceCents": 89999,
            "bullets": [
                "PrecisionVision Navigation avoids pet waste and cords",
                "Self-Emptying Clean Base holds 60 days of debris",
                "3-Stage Cleaning System with powerful suction",
                "Smart Mapping learns your home's layout",
                "Works with Alexa and Google Assistant"
            ],
            "description": "Roomba j7+ identifies and avoids obstacles like pet waste and charging cords. It also automatically empties itself into an enclosed bag for hands-free cleaning.",
            "attributes": {"runtime": "75 minutes", "navigation": "PrecisionVision", "selfEmpty": "Yes"},
            "sellerId": "seller_homehaven",
        },
        {
            "slug": "nespresso-vertuo-plus-coffee-machine",
            "title": "Nespresso Vertuo Plus Coffee and Espresso Machine by De'Longhi",
            "brand": "Nespresso",
            "priceCents": 17999,
            "listPriceCents": 20999,
            "bullets": [
                "Centrifusion technology for perfect crema",
                "5 cup sizes from espresso to alto",
                "One-touch brewing system",
                "Automatic capsule recognition",
                "40 oz. water tank with fast heat-up"
            ],
            "description": "The Nespresso Vertuo Plus uses Centrifusion technology to gently extract the coffee for a cup with perfect crema. One-touch brewing delivers barista-quality results.",
            "attributes": {"cupSizes": "5", "waterTank": "40 oz", "technology": "Centrifusion"},
            "sellerId": "seller_homehaven",
        },
    ],
    "cat_books": [
        {
            "slug": "atomic-habits-james-clear",
            "title": "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
            "brand": "James Clear",
            "priceCents": 1899,
            "listPriceCents": 2700,
            "bullets": [
                "#1 New York Times bestseller with 10 million+ copies sold",
                "Practical strategies for forming good habits",
                "Learn the Four Laws of Behavior Change",
                "Backed by cognitive and neuroscience research",
                "Available in hardcover, paperback, and audiobook"
            ],
            "description": "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
            "attributes": {"pages": "320", "format": "Hardcover", "language": "English"},
            "sellerId": "seller_bookworm",
        },
        {
            "slug": "project-hail-mary-andy-weir",
            "title": "Project Hail Mary: A Novel by Andy Weir",
            "brand": "Andy Weir",
            "priceCents": 1599,
            "listPriceCents": 2899,
            "bullets": [
                "#1 New York Times Bestseller",
                "From the author of The Martian",
                "Soon to be a major motion picture",
                "A lone astronaut must save humanity",
                "Perfect blend of science and adventure"
            ],
            "description": "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. A page-turning interstellar adventure from the author of The Martian.",
            "attributes": {"pages": "496", "format": "Paperback", "language": "English"},
            "sellerId": "seller_bookworm",
        },
        {
            "slug": "the-psychology-of-money",
            "title": "The Psychology of Money: Timeless lessons on wealth, greed, and happiness",
            "brand": "Morgan Housel",
            "priceCents": 1699,
            "listPriceCents": 1999,
            "bullets": [
                "Over 3 million copies sold worldwide",
                "19 short stories about the strange ways people think about money",
                "Learn why financial success is more about behavior than knowledge",
                "Accessible and engaging writing style",
                "Perfect for anyone interested in personal finance"
            ],
            "description": "Doing well with money isn't necessarily about what you know. It's about how you behave. Morgan Housel shares 19 short stories exploring the strange ways people think about money.",
            "attributes": {"pages": "256", "format": "Paperback", "language": "English"},
            "sellerId": "seller_bookworm",
        },
        {
            "slug": "fourth-wing-rebecca-yarros",
            "title": "Fourth Wing (The Empyrean Book 1) by Rebecca Yarros",
            "brand": "Rebecca Yarros",
            "priceCents": 2099,
            "listPriceCents": 2999,
            "bullets": [
                "#1 New York Times bestselling fantasy novel",
                "BookTok sensation with millions of readers",
                "Dragons, war, and forbidden romance",
                "First book in The Empyrean series",
                "Perfect for fans of romantasy"
            ],
            "description": "Enter the brutal and elite world of a war college for dragon riders. Twenty-year-old Violet Sorrengail was supposed to enter the Scribe Quadrant, but now she must survive the Riders Quadrant.",
            "attributes": {"pages": "528", "format": "Paperback", "language": "English"},
            "sellerId": "seller_bookworm",
        },
        {
            "slug": "thinking-fast-and-slow",
            "title": "Thinking, Fast and Slow by Daniel Kahneman",
            "brand": "Daniel Kahneman",
            "priceCents": 1899,
            "listPriceCents": 1899,
            "bullets": [
                "Winner of the National Academy of Sciences Best Book Award",
                "From Nobel Prize-winning economist Daniel Kahneman",
                "Explores the two systems that drive how we think",
                "Groundbreaking insights into decision making",
                "Essential reading for understanding human behavior"
            ],
            "description": "In this international bestseller, Daniel Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.",
            "attributes": {"pages": "499", "format": "Paperback", "language": "English"},
            "sellerId": "seller_bookworm",
        },
        {
            "slug": "where-the-crawdads-sing",
            "title": "Where the Crawdads Sing by Delia Owens",
            "brand": "Delia Owens",
            "priceCents": 1399,
            "listPriceCents": 1800,
            "bullets": [
                "Over 18 million copies sold worldwide",
                "Reese's Book Club Pick",
                "Now a major motion picture",
                "A murder mystery set in North Carolina marshland",
                "Unforgettable coming-of-age story"
            ],
            "description": "For years, rumors of the 'Marsh Girl' haunted Barkley Cove. When the town's golden boy is found dead, the locals immediately suspect Kya Clark.",
            "attributes": {"pages": "384", "format": "Paperback", "language": "English"},
            "sellerId": "seller_bookworm",
        },
    ],
    "cat_clothing": [
        {
            "slug": "levis-501-original-jeans",
            "title": "Levi's Men's 501 Original Fit Jeans",
            "brand": "Levi's",
            "priceCents": 6998,
            "listPriceCents": 6998,
            "bullets": [
                "The original straight fit jean since 1873",
                "Button fly closure",
                "Sits at waist with regular fit through thigh",
                "100% cotton for all-day comfort",
                "Signature leather patch on waistband"
            ],
            "description": "The iconic straight fit that started it all. The Levi's 501 Original is the authentic jean, featuring the signature button fly and straight leg.",
            "attributes": {"fit": "Original Straight", "material": "100% Cotton", "closure": "Button Fly"},
            "sellerId": "seller_glamour",
        },
        {
            "slug": "nike-air-max-270-mens",
            "title": "Nike Air Max 270 Men's Shoes",
            "brand": "Nike",
            "priceCents": 15000,
            "listPriceCents": 15000,
            "bullets": [
                "Max Air 270 unit in the heel for cushioned comfort",
                "Mesh and synthetic upper for breathability",
                "Foam midsole for lightweight support",
                "Rubber outsole for durable traction",
                "Iconic Air Max design"
            ],
            "description": "Nike's first lifestyle Air Max features Nike's tallest heel unit yet for unparalleled cushioning. The sleek design draws inspiration from Air Max icons.",
            "attributes": {"style": "Running Lifestyle", "cushioning": "Air Max 270", "upper": "Mesh"},
            "sellerId": "seller_sportspro",
        },
        {
            "slug": "patagonia-better-sweater-fleece",
            "title": "Patagonia Men's Better Sweater Fleece Jacket",
            "brand": "Patagonia",
            "priceCents": 14900,
            "listPriceCents": 14900,
            "bullets": [
                "Made with 100% recycled polyester fleece",
                "Sweater-knit exterior with fleece interior",
                "Stand-up collar with zipper garage",
                "Zippered handwarmer pockets",
                "Fair Trade Certified sewn"
            ],
            "description": "A classic fleece jacket with a sweater-knit face, fleece interior and refined details. Made with 100% recycled polyester that is Fair Trade Certified sewn.",
            "attributes": {"material": "Recycled Polyester", "style": "Fleece Jacket", "fit": "Regular"},
            "sellerId": "seller_glamour",
        },
        {
            "slug": "adidas-ultraboost-22-running",
            "title": "adidas Ultraboost 22 Running Shoes",
            "brand": "adidas",
            "priceCents": 19000,
            "listPriceCents": 19000,
            "bullets": [
                "BOOST midsole for incredible energy return",
                "Primeknit+ upper adapts to your foot",
                "Linear Energy Push system for propulsion",
                "Continental Rubber outsole for grip",
                "Made with Parley Ocean Plastic"
            ],
            "description": "Experience incredible energy return with every stride. The Ultraboost 22 features responsive BOOST cushioning and a Primeknit+ upper that adapts to your foot.",
            "attributes": {"technology": "BOOST", "upper": "Primeknit+", "sustainability": "Parley Ocean Plastic"},
            "sellerId": "seller_sportspro",
        },
        {
            "slug": "carhartt-hooded-sweatshirt",
            "title": "Carhartt Men's Midweight Hooded Sweatshirt",
            "brand": "Carhartt",
            "priceCents": 5999,
            "listPriceCents": 6499,
            "bullets": [
                "10.5-ounce midweight cotton/polyester blend",
                "Attached hood with drawcord closure",
                "Front kangaroo pocket",
                "Rib-knit cuffs and waistband",
                "Carhartt logo on front pocket"
            ],
            "description": "Built for work and comfort. This midweight hooded sweatshirt features a cotton/polyester blend for durability and warmth.",
            "attributes": {"material": "Cotton/Polyester Blend", "weight": "10.5 oz", "style": "Hooded"},
            "sellerId": "seller_glamour",
        },
        {
            "slug": "north-face-thermoball-jacket",
            "title": "The North Face Men's ThermoBall Eco Jacket",
            "brand": "The North Face",
            "priceCents": 22000,
            "listPriceCents": 22000,
            "bullets": [
                "ThermoBall Eco insulation made from recycled materials",
                "Maintains warmth even when wet",
                "Lightweight and packable design",
                "Secure-zip hand pockets",
                "Stows in its own pocket for easy travel"
            ],
            "description": "ThermoBall Eco insulation mimics down clusters and maintains warmth even when wet. Made with recycled materials for reduced environmental impact.",
            "attributes": {"insulation": "ThermoBall Eco", "packable": "Yes", "material": "Recycled"},
            "sellerId": "seller_sportspro",
        },
    ],
    "cat_sports": [
        {
            "slug": "yeti-rambler-30oz-tumbler",
            "title": "YETI Rambler 30 oz Tumbler with MagSlider Lid",
            "brand": "YETI",
            "priceCents": 3800,
            "listPriceCents": 3800,
            "bullets": [
                "Double-wall vacuum insulation keeps drinks cold or hot",
                "18/8 stainless steel construction",
                "MagSlider Lid for splash resistance",
                "Fits standard-size cup holders",
                "Dishwasher safe"
            ],
            "description": "The YETI Rambler keeps your coffee hot from the first sip to the last drop. Double-wall vacuum insulation and kitchen-grade stainless steel construction.",
            "attributes": {"capacity": "30 oz", "insulation": "Double-wall vacuum", "material": "Stainless Steel"},
            "sellerId": "seller_sportspro",
        },
        {
            "slug": "fitbit-charge-6-fitness-tracker",
            "title": "Fitbit Charge 6 Advanced Fitness & Health Tracker",
            "brand": "Fitbit",
            "priceCents": 15995,
            "listPriceCents": 15995,
            "bullets": [
                "Built-in GPS for pace and distance tracking",
                "24/7 heart rate and stress management",
                "Sleep tracking with Sleep Score",
                "40+ exercise modes with automatic tracking",
                "Up to 7 days battery life"
            ],
            "description": "Fitbit Charge 6 offers advanced health metrics including heart rate zones, stress management, and sleep tracking. Built-in GPS for accurate pace tracking.",
            "attributes": {"gps": "Built-in", "batteryLife": "7 days", "waterResistant": "50m"},
            "sellerId": "seller_sportspro",
        },
        {
            "slug": "coleman-4-person-dome-tent",
            "title": "Coleman Sundome 4-Person Camping Tent",
            "brand": "Coleman",
            "priceCents": 8999,
            "listPriceCents": 10999,
            "bullets": [
                "Fits 4 people or 1 queen-size air bed",
                "WeatherTec system with patented welded floors",
                "Easy setup in 10 minutes",
                "Large windows and ground vent for ventilation",
                "Snag-free continuous pole sleeves"
            ],
            "description": "The Coleman Sundome is designed for quick, easy setup in about 10 minutes. The WeatherTec system features patented welded floors and inverted seams to keep water out.",
            "attributes": {"capacity": "4 Person", "dimensions": "9' x 7'", "height": "4'11\""},
            "sellerId": "seller_sportspro",
        },
        {
            "slug": "hydro-flask-32oz-water-bottle",
            "title": "Hydro Flask 32 oz Wide Mouth Water Bottle with Flex Cap",
            "brand": "Hydro Flask",
            "priceCents": 4495,
            "listPriceCents": 4495,
            "bullets": [
                "TempShield double-wall vacuum insulation",
                "Keeps drinks cold 24 hours, hot 12 hours",
                "Pro-grade stainless steel construction",
                "BPA-free and phthalate-free",
                "Wide mouth for easy filling and cleaning"
            ],
            "description": "Hydro Flask's TempShield technology keeps beverages cold for up to 24 hours and hot for up to 12 hours. Pro-grade stainless steel won't retain or transfer flavors.",
            "attributes": {"capacity": "32 oz", "insulation": "TempShield", "material": "Stainless Steel"},
            "sellerId": "seller_sportspro",
        },
        {
            "slug": "garmin-forerunner-265-gps",
            "title": "Garmin Forerunner 265 GPS Running Smartwatch",
            "brand": "Garmin",
            "priceCents": 44999,
            "listPriceCents": 44999,
            "bullets": [
                "Vibrant AMOLED display with touchscreen",
                "Advanced running dynamics and training metrics",
                "Morning Report with sleep, HRV, and weather",
                "Up to 13 days battery in smartwatch mode",
                "Music storage for offline listening"
            ],
            "description": "Train smarter with the Garmin Forerunner 265. Advanced running dynamics, training readiness, and a vibrant AMOLED display help you reach your goals.",
            "attributes": {"display": "AMOLED", "batteryLife": "13 days", "gps": "Multi-band"},
            "sellerId": "seller_sportspro",
        },
        {
            "slug": "yoga-mat-extra-thick",
            "title": "Gaiam Premium Extra-Thick Yoga Mat with Carrying Strap",
            "brand": "Gaiam",
            "priceCents": 3499,
            "listPriceCents": 3999,
            "bullets": [
                "Extra-thick 6mm cushioning for joint support",
                "Non-slip textured surface",
                "Lightweight and easy to transport",
                "Free from harmful phthalates",
                "Includes yoga mat carrier strap"
            ],
            "description": "Extra-thick premium yoga mat provides optimal cushioning for your joints during any yoga practice. The textured non-slip surface provides excellent traction.",
            "attributes": {"thickness": "6mm", "dimensions": "68\" x 24\"", "material": "PVC-free"},
            "sellerId": "seller_sportspro",
        },
    ],
    "cat_beauty": [
        {
            "slug": "dyson-airwrap-complete",
            "title": "Dyson Airwrap Multi-Styler Complete",
            "brand": "Dyson",
            "priceCents": 59999,
            "listPriceCents": 59999,
            "bullets": [
                "Curl, wave, smooth, and dry with one tool",
                "Coanda effect uses air to style, not extreme heat",
                "Includes 6 attachments for multiple styles",
                "Intelligent heat control protects hair",
                "Works on damp hair, no extreme heat damage"
            ],
            "description": "The Dyson Airwrap uses the Coanda effect to curl, wave, smooth, and dry hair with no extreme heat. Includes multiple attachments for any style.",
            "attributes": {"attachments": "6", "heatSettings": "3", "technology": "Coanda"},
            "sellerId": "seller_glamour",
        },
        {
            "slug": "olaplex-no3-hair-perfector",
            "title": "OLAPLEX No. 3 Hair Perfector Treatment",
            "brand": "OLAPLEX",
            "priceCents": 3000,
            "listPriceCents": 3000,
            "bullets": [
                "Reduces breakage and strengthens hair",
                "Repairs damage from heat and chemical treatments",
                "Restores healthy appearance and texture",
                "Suitable for all hair types",
                "Award-winning patented technology"
            ],
            "description": "OLAPLEX No. 3 is a weekly at-home treatment that reduces breakage and strengthens hair, restoring your hair's healthy appearance and texture.",
            "attributes": {"size": "3.3 oz", "hairType": "All Hair Types", "treatment": "Weekly"},
            "sellerId": "seller_glamour",
        },
        {
            "slug": "cetaphil-gentle-skin-cleanser",
            "title": "Cetaphil Gentle Skin Cleanser for Face & Body",
            "brand": "Cetaphil",
            "priceCents": 1599,
            "listPriceCents": 1799,
            "bullets": [
                "Dermatologist recommended for sensitive skin",
                "Gentle, soap-free formula",
                "pH-balanced and hypoallergenic",
                "Won't strip skin of natural oils",
                "For face and body use"
            ],
            "description": "Cetaphil Gentle Skin Cleanser is the #1 dermatologist recommended face wash. The mild, soap-free formula is ideal for sensitive skin.",
            "attributes": {"size": "16 oz", "skinType": "Sensitive", "formula": "Soap-free"},
            "sellerId": "seller_glamour",
        },
        {
            "slug": "maybelline-sky-high-mascara",
            "title": "Maybelline Lash Sensational Sky High Mascara",
            "brand": "Maybelline",
            "priceCents": 1299,
            "listPriceCents": 1299,
            "bullets": [
                "Limitless length and full volume",
                "Bamboo extract-infused formula",
                "Flex Tower brush for coating every lash",
                "No clumping or flaking",
                "Available in Washable and Waterproof"
            ],
            "description": "Sky High Mascara delivers limitless length. The bamboo fiber-infused formula and Flex Tower brush create sky-high lash impact.",
            "attributes": {"type": "Washable", "color": "Very Black", "features": "Lengthening"},
            "sellerId": "seller_glamour",
        },
        {
            "slug": "cerave-moisturizing-cream",
            "title": "CeraVe Moisturizing Cream for Face and Body",
            "brand": "CeraVe",
            "priceCents": 1869,
            "listPriceCents": 1869,
            "bullets": [
                "3 essential ceramides to restore skin barrier",
                "MVE technology provides 24-hour hydration",
                "Developed with dermatologists",
                "Fragrance-free and non-comedogenic",
                "National Eczema Association Seal of Acceptance"
            ],
            "description": "CeraVe Moisturizing Cream provides 24-hour hydration and helps restore the protective skin barrier with three essential ceramides.",
            "attributes": {"size": "19 oz", "skinType": "Dry", "features": "Fragrance-free"},
            "sellerId": "seller_glamour",
        },
        {
            "slug": "the-ordinary-niacinamide-serum",
            "title": "The Ordinary Niacinamide 10% + Zinc 1% Serum",
            "brand": "The Ordinary",
            "priceCents": 999,
            "listPriceCents": 999,
            "bullets": [
                "High-strength vitamin and mineral formula",
                "Reduces appearance of blemishes",
                "Balances visible sebum activity",
                "Water-based for lightweight feel",
                "Cruelty-free and vegan"
            ],
            "description": "A high-strength vitamin and mineral blemish formula. Niacinamide reduces the appearance of skin blemishes and congestion, while zinc balances sebum activity.",
            "attributes": {"size": "30 ml", "skinConcern": "Blemishes", "ingredients": "Niacinamide, Zinc"},
            "sellerId": "seller_glamour",
        },
    ],
    "cat_toys": [
        {
            "slug": "lego-star-wars-millennium-falcon",
            "title": "LEGO Star Wars Millennium Falcon Building Set (75375)",
            "brand": "LEGO",
            "priceCents": 16999,
            "listPriceCents": 16999,
            "bullets": [
                "1,353 pieces for an engaging build",
                "Includes Han Solo, Chewbacca, and Lando minifigures",
                "Opening cockpit and hidden compartments",
                "Rotating top and bottom laser turrets",
                "Display stand with information plaque"
            ],
            "description": "Build the iconic Millennium Falcon from Star Wars. Features detailed interior, rotating turrets, and includes classic characters as LEGO minifigures.",
            "attributes": {"pieces": "1,353", "minifigures": "4", "age": "9+"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "nintendo-switch-oled-model",
            "title": "Nintendo Switch OLED Model with White Joy-Con",
            "brand": "Nintendo",
            "priceCents": 34999,
            "listPriceCents": 34999,
            "bullets": [
                "Vibrant 7-inch OLED screen",
                "Wide adjustable stand for tabletop mode",
                "Enhanced audio with built-in speakers",
                "64GB internal storage (expandable)",
                "Wired LAN port in dock for stable online play"
            ],
            "description": "The Nintendo Switch OLED Model features a vibrant 7-inch OLED screen, a wide adjustable stand, enhanced audio, and 64GB of internal storage.",
            "attributes": {"screen": "7-inch OLED", "storage": "64GB", "modes": "3"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "monopoly-classic-board-game",
            "title": "Monopoly Classic Board Game",
            "brand": "Hasbro",
            "priceCents": 2499,
            "listPriceCents": 2499,
            "bullets": [
                "The classic fast-dealing property trading game",
                "Buy, sell, and trade properties",
                "Build houses and hotels",
                "Collect rent from opponents",
                "2-8 players, ages 8+"
            ],
            "description": "The classic Monopoly board game where players buy, sell, and trade properties while trying to bankrupt their opponents. A family favorite for generations.",
            "attributes": {"players": "2-8", "age": "8+", "playTime": "60-180 min"},
            "sellerId": "seller_homehaven",
        },
        {
            "slug": "playstation-5-console",
            "title": "PlayStation 5 Console",
            "brand": "Sony",
            "priceCents": 49999,
            "listPriceCents": 49999,
            "bullets": [
                "Custom AMD Zen 2 CPU and RDNA 2 GPU",
                "Ultra-high speed SSD for lightning-fast loading",
                "Ray tracing for realistic lighting effects",
                "Tempest 3D AudioTech for immersive sound",
                "DualSense wireless controller included"
            ],
            "description": "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.",
            "attributes": {"storage": "825GB SSD", "resolution": "4K", "frameRate": "120fps"},
            "sellerId": "seller_techzone",
        },
        {
            "slug": "magna-tiles-100-piece-set",
            "title": "Magna-Tiles Clear Colors 100-Piece Building Set",
            "brand": "Magna-Tiles",
            "priceCents": 12999,
            "listPriceCents": 12999,
            "bullets": [
                "100 colorful magnetic tiles",
                "Develops STEM skills through play",
                "Compatible with all Magna-Tiles products",
                "Safe for children ages 3+",
                "Award-winning educational toy"
            ],
            "description": "Magna-Tiles are magnetic building tiles that inspire creativity, brain development, and imaginative play. Clear colors let light shine through for beautiful creations.",
            "attributes": {"pieces": "100", "age": "3+", "material": "BPA-free ABS plastic"},
            "sellerId": "seller_homehaven",
        },
        {
            "slug": "hot-wheels-ultimate-garage",
            "title": "Hot Wheels Ultimate Garage Playset with 2 Cars",
            "brand": "Hot Wheels",
            "priceCents": 10999,
            "listPriceCents": 13999,
            "bullets": [
                "Giant playset stands over 3 feet tall",
                "Stores 100+ Hot Wheels cars",
                "Features jet plane, gorilla attack, and more",
                "Side-by-side racing action",
                "Includes 2 Hot Wheels vehicles"
            ],
            "description": "The ultimate Hot Wheels playset with parking for 100+ cars, a jet plane launcher, gorilla attack, tune-up shop, and racing action. Over 3 feet of play!",
            "attributes": {"height": "Over 3 feet", "carStorage": "100+", "vehicles": "2 included"},
            "sellerId": "seller_homehaven",
        },
    ],
}


# Real product photos from Unsplash (stable, hotlinkable)
PRODUCT_IMAGES: dict[str, list[str]] = {
    "wireless-noise-cancelling-headphones": [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    ],
    "apple-airpods-pro-2nd-gen": [
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    ],
    "samsung-65-inch-4k-smart-tv": [
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80",
    ],
    "iphone-15-pro-max-256gb": [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    ],
    "jbl-flip-6-portable-speaker": [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    ],
    "kindle-paperwhite-11th-gen": [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
    ],
    "macbook-pro-14-m3-pro": [
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80",
    ],
    "dell-xps-15-laptop": [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=800&q=80",
    ],
    "logitech-mx-master-3s": [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    ],
    "mechanical-gaming-keyboard": [
        "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
    ],
    "samsung-32-curved-monitor": [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80",
    ],
    "webcam-4k-streaming": [
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
    ],
    "instant-pot-duo-7-in-1": [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1565452344518-47faca79dc69?auto=format&fit=crop&w=800&q=80",
    ],
    "dyson-v15-detect-vacuum": [
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
    ],
    "ninja-professional-blender": [
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80",
    ],
    "keurig-k-elite-coffee-maker": [
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    ],
    "philips-smart-led-bulbs-4pack": [
        "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
    ],
    "roomba-j7-robot-vacuum": [
        "https://images.unsplash.com/photo-1603618090561-412154b4bd1b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
    ],
    "nespresso-vertuo-plus-coffee-machine": [
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    ],
    "atomic-habits-james-clear": [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    ],
    "project-hail-mary-andy-weir": [
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
    ],
    "the-psychology-of-money": [
        "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    ],
    "fourth-wing-rebecca-yarros": [
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    ],
    "thinking-fast-and-slow": [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
    ],
    "where-the-crawdads-sing": [
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    ],
    "levis-501-original-jeans": [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
    "nike-air-max-270-mens": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
    ],
    "patagonia-better-sweater-fleece": [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
    ],
    "adidas-ultraboost-22-running": [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    ],
    "carhartt-hooded-sweatshirt": [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    ],
    "north-face-thermoball-jacket": [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80",
    ],
    "yeti-rambler-30oz-tumbler": [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=800&q=80",
    ],
    "fitbit-charge-6-fitness-tracker": [
        "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80",
    ],
    "coleman-4-person-dome-tent": [
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    ],
    "hydro-flask-32oz-water-bottle": [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80",
    ],
    "garmin-forerunner-265-gps": [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80",
    ],
    "yoga-mat-extra-thick": [
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    ],
    "dyson-airwrap-complete": [
        "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=800&q=80",
    ],
    "olaplex-no3-hair-perfector": [
        "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=800&q=80",
    ],
    "cetaphil-gentle-skin-cleanser": [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    ],
    "maybelline-sky-high-mascara": [
        "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    ],
    "cerave-moisturizing-cream": [
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
    ],
    "the-ordinary-niacinamide-serum": [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
    ],
    "lego-star-wars-millennium-falcon": [
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=80",
    ],
    "nintendo-switch-oled-model": [
        "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    ],
    "monopoly-classic-board-game": [
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&w=800&q=80",
    ],
    "playstation-5-console": [
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80",
    ],
    "magna-tiles-100-piece-set": [
        "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
    ],
    "hot-wheels-ultimate-garage": [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    ],
}

CATEGORY_FALLBACK_IMAGES = {
    "cat_electronics": [
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80"
    ],
    "cat_computers": [
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80"
    ],
    "cat_home": [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80"
    ],
    "cat_books": [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
    ],
    "cat_clothing": [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"
    ],
    "cat_sports": [
        "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80"
    ],
    "cat_beauty": [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
    ],
    "cat_toys": [
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80"
    ],
}


def product_images_for(slug: str, category_id: str) -> list[str]:
    """Return real product photos, falling back to a category image."""
    return PRODUCT_IMAGES.get(slug) or CATEGORY_FALLBACK_IMAGES.get(
        category_id,
        ["https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80"],
    )


def generate_product_id(slug: str) -> str:
    """Generate a product ID from slug."""
    return f"prod_{slug.replace('-', '_')[:30]}"


def generate_products() -> list[dict]:
    """Generate all products with metadata."""
    products = []
    now = datetime.now(timezone.utc)
    
    for category_id, category_products in PRODUCTS_DATA.items():
        for idx, prod in enumerate(category_products):
            product_id = generate_product_id(prod["slug"])
            
            # Randomize some values for variety
            rating_avg = round(random.uniform(3.5, 4.9), 1)
            rating_count = random.randint(50, 15000)
            stock = random.choice([0, 3, 5, 8, 15, 25, 50, 100, 250, 500])  # Some low stock for urgency
            
            images = product_images_for(prod["slug"], category_id)
            
            product = {
                "id": product_id,
                "slug": prod["slug"],
                "title": prod["title"],
                "brand": prod["brand"],
                "categoryId": category_id,
                "priceCents": prod["priceCents"],
                "listPriceCents": prod.get("listPriceCents", prod["priceCents"]),
                "images": images,
                "bullets": prod["bullets"],
                "description": prod["description"],
                "attributes": prod["attributes"],
                "ratingAvg": rating_avg,
                "ratingCount": rating_count,
                "stock": stock,
                "sellerId": prod["sellerId"],
                "status": "published",
                "createdAt": now,
                "updatedAt": now,
            }
            products.append(product)
    
    return products


async def update_product_images_only():
    """Patch image URLs on existing products without wiping other data."""
    settings = get_settings()
    print(f"Connecting to MongoDB: {settings.mongodb_uri}")
    client = AsyncIOMotorClient(settings.mongodb_uri, tlsCAFile=certifi.where())
    db = client.get_default_database()

    updated = 0
    async for product in db.products.find({}):
        slug = product.get("slug")
        category_id = product.get("categoryId", "")
        if not slug:
            continue
        images = product_images_for(slug, category_id)
        await db.products.update_one({"_id": product["_id"]}, {"$set": {"images": images}})
        updated += 1

    print(f"Updated images on {updated} products.")
    client.close()


async def seed_database(skip_confirm: bool = False):
    """Seed the database with demo data."""
    settings = get_settings()
    
    print(f"Connecting to MongoDB: {settings.mongodb_uri}")
    client = AsyncIOMotorClient(settings.mongodb_uri, tlsCAFile=certifi.where())
    db = client.get_default_database()
    
    # Confirm before clearing existing data
    print("\n⚠️  This will clear existing data in the following collections:")
    print("   - products")
    print("   - categories")
    print("   - sellers")
    
    if not skip_confirm:
        response = input("\nProceed? (y/N): ").strip().lower()
        if response != "y":
            print("Aborted.")
            return
    
    # Clear existing data
    print("\n🗑️  Clearing existing data...")
    await db.products.delete_many({})
    await db.categories.delete_many({})
    await db.sellers.delete_many({})
    print("   ✓ Cleared products, categories, and sellers")
    
    # Seed sellers
    print("\n👤 Seeding sellers...")
    now = datetime.now(timezone.utc)
    sellers_with_timestamps = [
        {**seller, "createdAt": now}
        for seller in SELLERS
    ]
    await db.sellers.insert_many(sellers_with_timestamps)
    print(f"   ✓ Inserted {len(SELLERS)} sellers")
    
    # Seed categories
    print("\n📁 Seeding categories...")
    await db.categories.insert_many(CATEGORIES)
    print(f"   ✓ Inserted {len(CATEGORIES)} categories")
    
    # Seed products
    print("\n📦 Seeding products...")
    products = generate_products()
    await db.products.insert_many(products)
    print(f"   ✓ Inserted {len(products)} products")
    
    # Print summary by category
    print("\n📊 Products by category:")
    for cat in CATEGORIES:
        count = len([p for p in products if p["categoryId"] == cat["id"]])
        print(f"   • {cat['name']}: {count} products")
    
    # Print summary by seller
    print("\n🏪 Products by seller:")
    for seller in SELLERS:
        count = len([p for p in products if p["sellerId"] == seller["id"]])
        print(f"   • {seller['displayName']}: {count} products")
    
    print("\n✅ Database seeded successfully!")
    
    # Close connection
    client.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed the Amazon Clone database")
    parser.add_argument(
        "--images-only",
        action="store_true",
        help="Update product image URLs without wiping other data",
    )
    parser.add_argument("--yes", action="store_true", help="Skip confirmation prompt")
    args = parser.parse_args()

    if args.images_only:
        asyncio.run(update_product_images_only())
    else:
        asyncio.run(seed_database(skip_confirm=args.yes))
