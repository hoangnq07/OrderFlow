-- V5__insert_sample_data.sql: Insert rich sample categories, products, orders, and order items

-- 1. Insert Sample Categories
INSERT INTO categories (id, name, slug, created_at, updated_at) VALUES
(1, 'Electronics', 'electronics', NOW(), NOW()),
(2, 'Computers & Laptops', 'computers-laptops', NOW(), NOW()),
(3, 'Smartphones & Accessories', 'smartphones-accessories', NOW(), NOW()),
(4, 'Audio & Headphones', 'audio-headphones', NOW(), NOW()),
(5, 'Gaming & Consoles', 'gaming-consoles', NOW(), NOW()),
(6, 'Smart Home Devices', 'smart-home-devices', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 2. Insert Sample Products
INSERT INTO products (id, name, slug, description, price, stock, category_id, image_url, active, version, search_vector, created_at, updated_at) VALUES
(1, 'MacBook Pro 16" M3 Max', 'macbook-pro-16-m3-max', 'Apple M3 Max chip with 16-core CPU and 40-core GPU, 36GB Unified Memory, 1TB SSD Storage.', 2499.00, 25, 2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'MacBook Pro 16 M3 Max Apple 36GB 1TB SSD Laptop'), NOW(), NOW()),
(2, 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'Titanium design, A17 Pro chip, 48MP Main Camera, 5x Telephoto lens, Action Button.', 1199.99, 50, 3, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'iPhone 15 Pro Max 256GB Titanium Apple Smartphone'), NOW(), NOW()),
(3, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Galaxy AI, Snapdragon 8 Gen 3, 200MP Camera, Built-in S Pen, 5000mAh Battery.', 1299.99, 40, 3, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'Samsung Galaxy S24 Ultra Android Smartphone Galaxy AI 200MP'), NOW(), NOW()),
(4, 'Sony WH-1000XM5 Wireless Headphones', 'sony-wh-1000xm5-wireless-headphones', 'Industry-leading noise canceling headphones with Auto NC Optimizer, 30-hour battery life.', 399.99, 80, 4, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'Sony WH-1000XM5 Wireless Headphones Noise Canceling Audio'), NOW(), NOW()),
(5, 'Sony PlayStation 5 Slim Console', 'sony-playstation-5-slim-console', 'Experience lightning-fast loading with an ultra-high speed SSD, 4K gaming, 1TB storage.', 499.99, 35, 5, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'Sony PlayStation 5 PS5 Slim Console 4K Gaming SSD'), NOW(), NOW()),
(6, 'Dell XPS 15 OLED Laptop', 'dell-xps-15-oled-laptop', '15.6" 3.5K OLED Touch Display, Intel Core i9-13900H, NVIDIA RTX 4070, 32GB RAM, 1TB SSD.', 1799.50, 30, 2, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'Dell XPS 15 OLED Laptop Intel i9 RTX 4070 32GB RAM'), NOW(), NOW()),
(7, 'Apple AirPods Pro (2nd Generation)', 'apple-airpods-pro-2nd-gen', 'Active Noise Cancellation, Transparency mode, Personalized Spatial Audio, MagSafe Charging Case.', 249.00, 100, 4, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'Apple AirPods Pro 2nd Gen Wireless Earbuds Noise Cancellation'), NOW(), NOW()),
(8, 'Nintendo Switch OLED Model', 'nintendo-switch-oled-model', '7-inch OLED screen, wide adjustable stand, 64GB internal storage, enhanced audio.', 349.99, 60, 5, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'Nintendo Switch OLED Model Gaming Console Portable Handheld'), NOW(), NOW()),
(9, 'LG C3 65" 4K OLED Smart TV', 'lg-c3-65-4k-oled-tv', 'a9 AI Processor Gen6, Brightness Booster, Dolby Vision & Atmos, 120Hz Refresh Rate.', 1599.00, 15, 1, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'LG C3 65 inch 4K OLED Smart TV 120Hz Dolby Vision'), NOW(), NOW()),
(10, 'Amazon Echo Show 10 (3rd Gen)', 'amazon-echo-show-10-3rd-gen', '10.1" HD smart display with motion and Alexa, built-in smart home hub, 13MP camera.', 249.99, 50, 6, 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80', true, 0, to_tsvector('english', 'Amazon Echo Show 10 Smart Display Alexa Smart Home Hub'), NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 3. Insert Sample Customer Orders
INSERT INTO orders (id, user_id, status, total_amount, shipping_address, note, created_at, updated_at) VALUES
(101, 2, 'DELIVERED', 2898.99, '742 Evergreen Terrace, Springfield, OR', 'Please leave at front door', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
(102, 2, 'SHIPPED', 648.99, '123 Main Street, Apt 4B, New York, NY', 'Call upon arrival', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
(103, 2, 'PROCESSING', 1299.99, '456 Market St, San Francisco, CA', 'Fragile electronics', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours'),
(104, 2, 'CONFIRMED', 499.99, '789 Broadway Ave, Austin, TX', 'Standard shipping', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '2 hours'),
(105, 2, 'PENDING', 2499.00, '101 Pine Lane, Seattle, WA', 'Gift wrap requested', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- 4. Insert Sample Order Items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
(1, 101, 1, 'MacBook Pro 16" M3 Max', 1, 2499.00, 2499.00),
(2, 101, 4, 'Sony WH-1000XM5 Wireless Headphones', 1, 399.99, 399.99),
(3, 102, 4, 'Sony WH-1000XM5 Wireless Headphones', 1, 399.99, 399.99),
(4, 102, 7, 'Apple AirPods Pro (2nd Generation)', 1, 249.00, 249.00),
(5, 103, 3, 'Samsung Galaxy S24 Ultra', 1, 1299.99, 1299.99),
(6, 104, 5, 'Sony PlayStation 5 Slim Console', 1, 499.99, 499.99),
(7, 105, 1, 'MacBook Pro 16" M3 Max', 1, 2499.00, 2499.00)
ON CONFLICT (id) DO NOTHING;

SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
