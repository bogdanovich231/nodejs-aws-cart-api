INSERT INTO users (id) VALUES (gen_random_uuid())

INSERT INTO carts (user_id, status) 
SELECT id, 'OPEN' FROM users LIMIT 1;

INSERT INTO cart_items (cart_id, product_id, count) 
SELECT c.id,  gen_random_uuid(), 3
FROM carts c
WHERE c.status = 'OPEN' 
LIMIT 1;

SELECT * FROM users; 
SELECT * FROM carts;

INSERT INTO orders (
    id,
    user_id,
    cart_id,
    payment,
    delivery,
    comments,
    status,
    total
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM carts WHERE status = 'OPEN' LIMIT 1),
    '{
        "type": "credit_card",
        "card_number": "****4242",
        "expiry": "12/25"
    }'::jsonb, 
    '{
        "address": "123 st",
        "city": "Wroclaw",
        "zip": "201547"
    }'::jsonb, 
    'hello', 
    'ORDERED', 
    1234 
);