create extension if not exists "uuid-ossp";

create table if not exists  carts (
    id uuid not null default uuid_generate_v4() primary key,
    user_id uuid not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    status varchar(10) check (status in ('OPEN', 'ORDERED')) not null
);

create table if not exists  cart_items (
    cart_id uuid not null references carts(id) on delete cascade,
    product_id uuid not null,
    count integer not null check (count > 0)
);

insert into carts (id, user_id, created_at, updated_at, status) values
    ('550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000', now(), now(), 'OPEN'),
    ('550e8400-e29b-41d4-a716-446655440001', '123e4567-e89b-12d3-a456-426614174001', now(), now(), 'ORDERED');

insert into cart_items (cart_id, product_id, count) values
    ('550e8400-e29b-41d4-a716-446655440000', '987e4567-e89b-12d3-a456-426614174000', 2),
    ('550e8400-e29b-41d4-a716-446655440000', '987e4567-e89b-12d3-a456-426614174001', 1),
    ('550e8400-e29b-41d4-a716-446655440001', '987e4567-e89b-12d3-a456-426614174002', 5);