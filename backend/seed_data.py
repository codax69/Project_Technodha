import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.authentication.models import User
from apps.products.models import Category, Product
from apps.orders.models import Order, OrderItem

def seed():
    print("Starting Database Seeding (40 Products)...")

    # 1. Create Users (Admin & Customer)
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@technodha.com',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if not admin_user.check_password('admin123'):
        admin_user.set_password('admin123')
        admin_user.save()

    customer_user, _ = User.objects.get_or_create(
        username='customer1',
        defaults={
            'email': 'customer1@example.com',
            'role': 'customer',
        }
    )
    if not customer_user.check_password('customer123'):
        customer_user.set_password('customer123')
        customer_user.save()

    print("Users verified (admin: admin123, customer1: customer123)")

    # 2. Create Categories
    categories_data = [
        {"name": "Electronics & Computers", "slug": "electronics-computers"},
        {"name": "Peripherals & Accessories", "slug": "peripherals-accessories"},
        {"name": "Networking & Storage", "slug": "networking-storage"},
        {"name": "Smart Home & Gadgets", "slug": "smart-home-gadgets"},
        {"name": "Office Supplies", "slug": "office-supplies"},
    ]

    categories = []
    for cat_info in categories_data:
        cat, created = Category.objects.get_or_create(
            slug=cat_info['slug'],
            defaults={'name': cat_info['name']}
        )
        categories.append(cat)

    print(f"Seeded {len(categories)} categories.")

    # 3. Create 40 Diverse Products
    products_list = [
        # Electronics & Computers (0)
        {"name": "Technodha ProBook Laptop 15.6\"", "price": "54999.00", "stock": 15, "cat": 0, "img": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", "desc": "High performance Intel Core i7 laptop with 16GB RAM and 512GB NVMe SSD."},
        {"name": "UltraWide 27\" IPS 4K Monitor", "price": "24999.00", "stock": 8, "cat": 0, "img": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80", "desc": "4K UHD IPS display with 144Hz refresh rate, HDR400, and USB-C power delivery."},
        {"name": "Gamer Xtreme Desktop Workstation", "price": "89999.00", "stock": 6, "cat": 0, "img": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80", "desc": "Extreme gaming PC powered by RTX 4070, 32GB DDR5 RAM, and liquid cooling system."},
        {"name": "Compact Mini PC Barebone System", "price": "19999.00", "stock": 12, "cat": 0, "img": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80", "desc": "Space-saving mini desktop with quad-core processor and dual 4K HDMI outputs."},
        {"name": "Technodha OLED Tablet Pro 11\"", "price": "39999.00", "stock": 20, "cat": 0, "img": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80", "desc": "120Hz OLED tablet with stylus support, 128GB storage, and all-day battery life."},
        {"name": "Portable Dual Screen Monitor 14\"", "price": "14999.00", "stock": 9, "cat": 0, "img": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", "desc": "Full HD USB-C portable monitor for mobile productivity and multi-display setups."},
        {"name": "Enterprise Server Rack Blade 1U", "price": "124999.00", "stock": 4, "cat": 0, "img": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80", "desc": "Dual Xeon processor server with redundant hot-swap power supplies and 64GB ECC RAM."},
        {"name": "Graphic Design Pen Display 16\"", "price": "29999.00", "stock": 7, "cat": 0, "img": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80", "desc": "High precision 8192 pressure level drawing display for digital artists."},

        # Peripherals & Accessories (1)
        {"name": "Mechanical RGB Gaming Keyboard", "price": "3499.00", "stock": 25, "cat": 1, "img": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80", "desc": "Tactile mechanical switches with customizable per-key RGB backlighting and wrist rest."},
        {"name": "Ergonomic Wireless Mouse", "price": "1299.00", "stock": 3, "cat": 1, "img": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80", "desc": "Dual-mode Bluetooth & 2.4GHz wireless precision optical mouse with silent click buttons."},
        {"name": "Noise Cancelling Headphones", "price": "8999.00", "stock": 5, "cat": 1, "img": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", "desc": "Over-ear active noise cancelling Bluetooth headphones with 30-hour continuous playback."},
        {"name": "Full HD 1080p Streaming Webcam", "price": "2499.00", "stock": 14, "cat": 1, "img": "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600&q=80", "desc": "Auto-focus Full HD webcam with dual noise-reducing microphones and privacy cover."},
        {"name": "Studio Condenser USB Microphone", "price": "4299.00", "stock": 11, "cat": 1, "img": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80", "desc": "Cardioid studio USB mic for podcasting, voiceovers, and live streaming."},
        {"name": "USB-C Multi-Port Hub Adapter 7-in-1", "price": "1899.00", "stock": 30, "cat": 1, "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", "desc": "Aluminium hub featuring 4K HDMI, 100W PD charging, SD card reader, and USB 3.0 ports."},
        {"name": "Wireless Charging Mouse Pad XL", "price": "1599.00", "stock": 16, "cat": 1, "img": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80", "desc": "Extended Desk Mat with built-in 15W Qi wireless fast charger and stitched edges."},
        {"name": "Hi-Fi Desktop Bluetooth Speakers", "price": "4999.00", "stock": 10, "cat": 1, "img": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80", "desc": "Wooden enclosure bookshelf stereo speakers with optical and AUX inputs."},

        # Networking & Storage (2)
        {"name": "Dual-Band Wi-Fi 6 Mesh Router", "price": "4999.00", "stock": 2, "cat": 2, "img": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80", "desc": "High-speed Gigabit Wi-Fi 6 mesh router supporting up to 3000 Mbps throughput."},
        {"name": "1TB NVMe M.2 SSD Gen4", "price": "6499.00", "stock": 22, "cat": 2, "img": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80", "desc": "PCIe 4.0 ultra-fast internal solid state drive with up to 7000 MB/s read speeds."},
        {"name": "External Rugged 2TB Hard Drive", "price": "4299.00", "stock": 19, "cat": 2, "img": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=80", "desc": "Shockproof and water-resistant portable USB 3.2 external HDD for data backups."},
        {"name": "4-Bay Network Attached Storage (NAS)", "price": "28999.00", "stock": 5, "cat": 2, "img": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80", "desc": "Centralized cloud storage enclosure with dual 2.5GbE LAN and hardware encryption."},
        {"name": "Unmanaged 16-Port Gigabit Switch", "price": "3199.00", "stock": 13, "cat": 2, "img": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80", "desc": "Plug-and-play metal casing network switch with fanless quiet design."},
        {"name": "Cat8 Ethernet Patch Cable 10m", "price": "599.00", "stock": 45, "cat": 2, "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", "desc": "High speed 40Gbps SSTP shielded gold-plated network cord."},
        {"name": "Wi-Fi Range Extender Dual Band", "price": "1699.00", "stock": 17, "cat": 2, "img": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80", "desc": "Wall-plug Wi-Fi booster with external antennas and Ethernet port."},
        {"name": "256GB High Speed USB 3.2 Flash Drive", "price": "1199.00", "stock": 35, "cat": 2, "img": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80", "desc": "Metal body thumb drive with password protection and keychain ring."},

        # Smart Home & Gadgets (3)
        {"name": "Smart Ambient Desk Lamp", "price": "2199.00", "stock": 18, "cat": 3, "img": "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&q=80", "desc": "Dimmable LED lamp with smartphone app integration and 10W wireless charging pad."},
        {"name": "Smart Security Outdoor Camera 2K", "price": "3799.00", "stock": 12, "cat": 3, "img": "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=600&q=80", "desc": "Weatherproof wireless IP camera with night vision, motion alert, and two-way audio."},
        {"name": "Wi-Fi Smart Power Strip 4-Outlet", "price": "1499.00", "stock": 25, "cat": 3, "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", "desc": "Surge protector with individual app control and 4 USB fast charging ports."},
        {"name": "Automatic Robotic Vacuum Cleaner", "price": "18999.00", "stock": 7, "cat": 3, "img": "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&q=80", "desc": "LiDAR navigation robot vacuum with mop combo and self-emptying base station."},
        {"name": "Smart RGB LED Light Strip 5M", "price": "899.00", "stock": 40, "cat": 3, "img": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80", "desc": "Music sync addressable RGB light strip compatible with Alexa and Google Assistant."},
        {"name": "Digital Smart Fingerprint Door Lock", "price": "7999.00", "stock": 6, "cat": 3, "img": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80", "desc": "Keyless entry biometric lock with RFID cards, passcode pin, and mobile app unlocking."},
        {"name": "Smart Air Purifier with HEPA Filter", "price": "6499.00", "stock": 9, "cat": 3, "img": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80", "desc": "True HEPA H13 filtration air cleaner with real-time air quality indicator."},
        {"name": "Smart Thermostat Temperature Sensor", "price": "2999.00", "stock": 15, "cat": 3, "img": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80", "desc": "Programmable climate control thermostat with energy consumption tracking."},

        # Office Supplies (4)
        {"name": "Ergonomic Mesh Office Chair", "price": "11999.00", "stock": 10, "cat": 4, "img": "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=600&q=80", "desc": "High back breathable mesh chair with adjustable lumbar support and 3D armrests."},
        {"name": "Motorized Electric Standing Desk", "price": "21999.00", "stock": 5, "cat": 4, "img": "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80", "desc": "Dual motor height-adjustable sit-stand desk frame with memory height presets."},
        {"name": "Cross-Cut High Security Paper Shredder", "price": "3499.00", "stock": 14, "cat": 4, "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", "desc": "Heavy duty 12-sheet capacity paper and credit card shredder with bin window."},
        {"name": "All-in-One Wireless Laser Printer", "price": "14499.00", "stock": 8, "cat": 4, "img": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80", "desc": "Monochrome duplex printing, scanning, and copying machine with mobile cloud print."},
        {"name": "Aluminium Laptop Elevator Stand", "price": "1299.00", "stock": 28, "cat": 4, "img": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80", "desc": "Vented heat dissipation notebook riser compatible with laptops up to 17 inches."},
        {"name": "Dual Monitor Gas Spring Arm Mount", "price": "3299.00", "stock": 16, "cat": 4, "img": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80", "desc": "Full motion desk clamp mount supporting two 17-32\" screens with cable management."},
        {"name": "Surge Protector Extension Board 6-Way", "price": "999.00", "stock": 35, "cat": 4, "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", "desc": "Heavy duty master switch power strip with overload circuit breaker protection."},
        {"name": "Desk Cable Management Tray System", "price": "699.00", "stock": 50, "cat": 4, "img": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80", "desc": "Under desk wire organizer rack for neat setup and cord concealment."},
    ]

    seeded_products = []
    for item in products_list:
        p, created = Product.objects.update_or_create(
            name=item["name"],
            defaults={
                "description": item["desc"],
                "price": Decimal(item["price"]),
                "stock_quantity": item["stock"],
                "category": categories[item["cat"]],
                "image_url": item["img"],
                "is_active": True,
            }
        )
        seeded_products.append(p)

    print(f"Successfully seeded {len(seeded_products)} products into database!")

    # 4. Create Sample Orders
    statuses = ['completed', 'processing', 'pending', 'cancelled']
    current_orders_count = Order.objects.count()
    target_count = 25

    orders_to_create = target_count - current_orders_count
    if orders_to_create > 0:
        print(f"Creating {orders_to_create} sample orders...")
        for i in range(orders_to_create):
            status_choice = random.choice(statuses)
            selected_prods = random.sample(seeded_products, k=random.randint(1, min(3, len(seeded_products))))
            total_price = Decimal("0.00")

            order = Order.objects.create(
                customer=customer_user,
                status=status_choice,
                total_price=Decimal("0.00")
            )

            for prod in selected_prods:
                qty = random.randint(1, 2)
                unit_price = prod.price
                subtotal = unit_price * qty
                total_price += subtotal

                OrderItem.objects.create(
                    order=order,
                    product=prod,
                    quantity=qty,
                    unit_price_at_purchase=unit_price,
                    subtotal=subtotal
                )

            order.total_price = total_price
            order.save()

    print(f"Total Products in DB: {Product.objects.count()}")
    print(f"Total Orders in DB: {Order.objects.count()}")
    print("Seeding Completed Successfully!")

if __name__ == '__main__':
    seed()
