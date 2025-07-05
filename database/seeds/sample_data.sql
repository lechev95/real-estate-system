-- Insert sample properties
INSERT INTO properties (title, description, area, location, rooms, floor, total_floors, year_built, price_eur, price_bgn, rent_price_eur, rent_price_bgn, status) VALUES
('Двустаен апартамент в Център', 'Слънчев двустаен апартамент в сърцето на София', 68.0, 'София, Център', 2, 3, 8, 2015, 85000, 166300, 650, 1271, 'rented'),
('Къща в Бояна', 'Красива къща с градина в престижен район', 180.0, 'София, Бояна', 4, 1, 2, 2018, 280000, 547600, 1200, 2346, 'available'),
('Офис в Бизнес парк', 'Съвременен офис в бизнес парк', 120.0, 'София, Младост', 6, 5, 12, 2020, 150000, 293400, 800, 1564, 'sold');

-- Insert sample images
INSERT INTO property_images (property_id, image_url, image_order) VALUES
(1, 'https://via.placeholder.com/400x300?text=Apartment+Living+Room', 1),
(1, 'https://via.placeholder.com/400x300?text=Apartment+Kitchen', 2),
(1, 'https://via.placeholder.com/400x300?text=Apartment+Bedroom', 3),
(2, 'https://via.placeholder.com/400x300?text=House+Exterior', 1),
(2, 'https://via.placeholder.com/400x300?text=House+Garden', 2),
(3, 'https://via.placeholder.com/400x300?text=Office+Space', 1);
