-- VELLOURA market catalog seed (192 listings, batches 1+2).
-- Idempotent: skips any name already present. Run AFTER setup.sql.
-- Prices are owner-adjustable placeholders (150-400 GHS); edit via Seller Center.

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Alo white tee & brown pleated skirt set', 'Alo white tee & brown pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 250,
       array['S','M','L'], array['White', 'Brown'], 'New', true, 100, 'assets/products/alo-white-tee-brown-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Alo white tee & brown pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Lilac photo-print oversized tee', 'Lilac photo-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 195,
       array['S','M','L'], array['Lilac'], 'New', true, 101, 'assets/products/lilac-photo-print-oversized-tee.jpg'
where not exists (select 1 from public.products where name = 'Lilac photo-print oversized tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red ruched halter bodycon dress', 'Red ruched halter bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 275,
       array['S','M','L'], array['Red'], 'New', true, 102, 'assets/products/red-ruched-halter-bodycon-dress.jpg'
where not exists (select 1 from public.products where name = 'Red ruched halter bodycon dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Light-wash pearl denim mini skirt', 'Light-wash pearl denim mini skirt. A wardrobe-mixing skirt from the September market drop, photographed exactly as it arrives.', 355,
       array['S','M','L'], array['Multi'], 'New', true, 103, 'assets/products/light-wash-pearl-denim-mini-skirt.jpg'
where not exists (select 1 from public.products where name = 'Light-wash pearl denim mini skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red sweatshirt & pleated skirt set', 'Red sweatshirt & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 165,
       array['S','M','L'], array['Red'], 'New', true, 104, 'assets/products/red-sweatshirt-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Red sweatshirt & pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red-black striped halter dress', 'Red-black striped halter dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 170,
       array['S','M','L'], array['Black', 'Red'], 'New', true, 105, 'assets/products/red-black-striped-halter-dress.jpg'
where not exists (select 1 from public.products where name = 'Red-black striped halter dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black lace shrug & patchwork skirt set', 'Black lace shrug & patchwork skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 320,
       array['S','M','L'], array['Black'], 'New', true, 106, 'assets/products/black-lace-shrug-patchwork-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Black lace shrug & patchwork skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White tee & grey cargo trouser set', 'White tee & grey cargo trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 180,
       array['S','M','L'], array['White', 'Grey'], 'New', true, 107, 'assets/products/white-tee-grey-cargo-trouser-set.jpg'
where not exists (select 1 from public.products where name = 'White tee & grey cargo trouser set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Wine zip jacket & wide trouser set', 'Wine zip jacket & wide trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 265,
       array['S','M','L'], array['Wine'], 'New', true, 108, 'assets/products/wine-zip-jacket-wide-trouser-set.jpg'
where not exists (select 1 from public.products where name = 'Wine zip jacket & wide trouser set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Orange pleated maxi dress', 'Orange pleated maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 335,
       array['S','M','L'], array['Orange'], 'New', true, 109, 'assets/products/orange-pleated-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Orange pleated maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Striped knit two-piece bodycon set', 'Striped knit two-piece bodycon set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 165,
       array['S','M','L'], array['Multi'], 'New', true, 110, 'assets/products/striped-knit-two-piece-bodycon-set.jpg'
where not exists (select 1 from public.products where name = 'Striped knit two-piece bodycon set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink tee & straight-trouser co-ord', 'Pink tee & straight-trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 310,
       array['S','M','L'], array['Pink'], 'New', true, 111, 'assets/products/pink-tee-straight-trouser-co-ord.jpg'
where not exists (select 1 from public.products where name = 'Pink tee & straight-trouser co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Brown polo top & denim shorts set', 'Brown polo top & denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 215,
       array['S','M','L'], array['Brown'], 'New', true, 112, 'assets/products/brown-polo-top-denim-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Brown polo top & denim shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Lilac bow cargo trousers & top set', 'Lilac bow cargo trousers & top set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 160,
       array['S','M','L'], array['Lilac'], 'New', true, 113, 'assets/products/lilac-bow-cargo-trousers-top-set.jpg'
where not exists (select 1 from public.products where name = 'Lilac bow cargo trousers & top set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White zip-front dress with black trim', 'White zip-front dress with black trim. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 175,
       array['S','M','L'], array['White', 'Black'], 'New', true, 114, 'assets/products/white-zip-front-dress-with-black-trim.jpg'
where not exists (select 1 from public.products where name = 'White zip-front dress with black trim');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black hoodie & pleated skirt set with chain', 'Black hoodie & pleated skirt set with chain. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 285,
       array['S','M','L'], array['Black'], 'New', true, 115, 'assets/products/black-hoodie-pleated-skirt-set-with-chain.jpg'
where not exists (select 1 from public.products where name = 'Black hoodie & pleated skirt set with chain');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Wine spaghetti-strap mini dress', 'Wine spaghetti-strap mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 280,
       array['S','M','L'], array['Wine'], 'New', true, 116, 'assets/products/wine-spaghetti-strap-mini-dress.jpg'
where not exists (select 1 from public.products where name = 'Wine spaghetti-strap mini dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Tom & Jerry print white tee', 'Tom & Jerry print white tee. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 170,
       array['S','M','L'], array['White'], 'New', true, 117, 'assets/products/tom-jerry-print-white-tee.jpg'
where not exists (select 1 from public.products where name = 'Tom & Jerry print white tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Dark floral halter maxi dress', 'Dark floral halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 225,
       array['S','M','L'], array['Multi'], 'New', true, 118, 'assets/products/dark-floral-halter-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Dark floral halter maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Animal-print long-sleeve mini dress', 'Animal-print long-sleeve mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 175,
       array['S','M','L'], array['Multi'], 'New', true, 119, 'assets/products/animal-print-long-sleeve-mini-dress.jpg'
where not exists (select 1 from public.products where name = 'Animal-print long-sleeve mini dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Grey hoodie, top & pleated skirt set', 'Grey hoodie, top & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 325,
       array['S','M','L'], array['Grey'], 'New', true, 120, 'assets/products/grey-hoodie-top-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Grey hoodie, top & pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Teddy-bear cream hoodie & brown pleated skirt', 'Teddy-bear cream hoodie & brown pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 285,
       array['S','M','L'], array['Brown', 'Cream'], 'New', true, 121, 'assets/products/teddy-bear-cream-hoodie-brown-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Teddy-bear cream hoodie & brown pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Striped polo-collar tee (red / black)', 'Striped polo-collar tee (red / black). A quick-styling layer from the September market drop, photographed exactly as it arrives.', 165,
       array['S','M','L'], array['Black', 'Red'], 'New', true, 122, 'assets/products/striped-polo-collar-tee-red-black.jpg'
where not exists (select 1 from public.products where name = 'Striped polo-collar tee (red / black)');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black butterfly-print wide trousers', 'Black butterfly-print wide trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.', 330,
       array['S','M','L'], array['Black'], 'New', true, 123, 'assets/products/black-butterfly-print-wide-trousers.jpg'
where not exists (select 1 from public.products where name = 'Black butterfly-print wide trousers');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink alo tee & grey pleated skirt set', 'Pink alo tee & grey pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 185,
       array['S','M','L'], array['Pink', 'Grey'], 'New', true, 124, 'assets/products/pink-alo-tee-grey-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Pink alo tee & grey pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Neon green halter mini dress', 'Neon green halter mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 220,
       array['S','M','L'], array['Neon green', 'Green'], 'New', true, 125, 'assets/products/neon-green-halter-mini-dress.jpg'
where not exists (select 1 from public.products where name = 'Neon green halter mini dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White lace bra-top & navy shorts set', 'White lace bra-top & navy shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 350,
       array['S','M','L'], array['White', 'Navy'], 'New', true, 126, 'assets/products/white-lace-bra-top-navy-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'White lace bra-top & navy shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White top, colour-block shorts & cap set', 'White top, colour-block shorts & cap set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 350,
       array['S','M','L'], array['White'], 'New', true, 127, 'assets/products/white-top-colour-block-shorts-cap-set.jpg'
where not exists (select 1 from public.products where name = 'White top, colour-block shorts & cap set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink hoodie & sweat trouser co-ord', 'Pink hoodie & sweat trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 335,
       array['S','M','L'], array['Pink'], 'New', true, 128, 'assets/products/pink-hoodie-sweat-trouser-co-ord.jpg'
where not exists (select 1 from public.products where name = 'Pink hoodie & sweat trouser co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black lace shrug & floral skirt set', 'Black lace shrug & floral skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 165,
       array['S','M','L'], array['Black'], 'New', true, 129, 'assets/products/black-lace-shrug-floral-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Black lace shrug & floral skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink & white cargo trouser set', 'Pink & white cargo trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 330,
       array['S','M','L'], array['White', 'Pink'], 'New', true, 130, 'assets/products/pink-white-cargo-trouser-set.jpg'
where not exists (select 1 from public.products where name = 'Pink & white cargo trouser set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink bra-top & denim mini skirt', 'Pink bra-top & denim mini skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 335,
       array['S','M','L'], array['Pink'], 'New', true, 131, 'assets/products/pink-bra-top-denim-mini-skirt.jpg'
where not exists (select 1 from public.products where name = 'Pink bra-top & denim mini skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Light-blue off-shoulder maxi dress', 'Light-blue off-shoulder maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 275,
       array['S','M','L'], array['Blue'], 'New', true, 132, 'assets/products/light-blue-off-shoulder-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Light-blue off-shoulder maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Maroon top & trouser two-piece set', 'Maroon top & trouser two-piece set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 165,
       array['S','M','L'], array['Maroon'], 'New', true, 133, 'assets/products/maroon-top-trouser-two-piece-set.jpg'
where not exists (select 1 from public.products where name = 'Maroon top & trouser two-piece set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red one-shoulder bodycon dress', 'Red one-shoulder bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 220,
       array['S','M','L'], array['Red'], 'New', true, 134, 'assets/products/red-one-shoulder-bodycon-dress.jpg'
where not exists (select 1 from public.products where name = 'Red one-shoulder bodycon dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White blazer & shorts set', 'White blazer & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 160,
       array['S','M','L'], array['White'], 'New', true, 135, 'assets/products/white-blazer-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'White blazer & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Pink textured halter maxi dress', 'Pink textured halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 325,
       array['S','M','L'], array['Pink', 'Red'], 'New', true, 136, 'assets/products/pink-textured-halter-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Pink textured halter maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Blue satin slip mini dress', 'Blue satin slip mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 190,
       array['S','M','L'], array['Blue'], 'New', true, 137, 'assets/products/blue-satin-slip-mini-dress.jpg'
where not exists (select 1 from public.products where name = 'Blue satin slip mini dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White hoodie & trouser co-ord', 'White hoodie & trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 240,
       array['S','M','L'], array['White'], 'New', true, 138, 'assets/products/white-hoodie-trouser-co-ord.jpg'
where not exists (select 1 from public.products where name = 'White hoodie & trouser co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Argyle cardigan & brown pleated skirt set', 'Argyle cardigan & brown pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 280,
       array['S','M','L'], array['Brown'], 'New', true, 139, 'assets/products/argyle-cardigan-brown-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Argyle cardigan & brown pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red ruched sporty mini dress', 'Red ruched sporty mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 195,
       array['S','M','L'], array['Red'], 'New', true, 140, 'assets/products/red-ruched-sporty-mini-dress.jpg'
where not exists (select 1 from public.products where name = 'Red ruched sporty mini dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Pink strapless maxi dress', 'Pink strapless maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 320,
       array['S','M','L'], array['Pink'], 'New', true, 141, 'assets/products/pink-strapless-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Pink strapless maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Light-wash wide-leg jeans & tee set', 'Light-wash wide-leg jeans & tee set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 185,
       array['S','M','L'], array['Multi'], 'New', true, 142, 'assets/products/light-wash-wide-leg-jeans-tee-set.jpg'
where not exists (select 1 from public.products where name = 'Light-wash wide-leg jeans & tee set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Beige angel tee & pleated skirt set', 'Beige angel tee & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 330,
       array['S','M','L'], array['Beige'], 'New', true, 143, 'assets/products/beige-angel-tee-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Beige angel tee & pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red bandeau & shorts set', 'Red bandeau & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 245,
       array['S','M','L'], array['Red'], 'New', true, 144, 'assets/products/red-bandeau-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Red bandeau & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black-white raglan sweatshirt & blue skirt', 'Black-white raglan sweatshirt & blue skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 325,
       array['S','M','L'], array['Black-white', 'White'], 'New', true, 145, 'assets/products/black-white-raglan-sweatshirt-blue-skirt.jpg'
where not exists (select 1 from public.products where name = 'Black-white raglan sweatshirt & blue skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White top & black wide-leg trouser set', 'White top & black wide-leg trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 365,
       array['S','M','L'], array['White', 'Black'], 'New', true, 146, 'assets/products/white-top-black-wide-leg-trouser-set.jpg'
where not exists (select 1 from public.products where name = 'White top & black wide-leg trouser set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink sweatshirt & trouser co-ord', 'Pink sweatshirt & trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 205,
       array['S','M','L'], array['Pink'], 'New', true, 147, 'assets/products/pink-sweatshirt-trouser-co-ord.jpg'
where not exists (select 1 from public.products where name = 'Pink sweatshirt & trouser co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink bra-top & shorts set', 'Pink bra-top & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 180,
       array['S','M','L'], array['Pink'], 'New', true, 148, 'assets/products/pink-bra-top-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Pink bra-top & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red Labella top, skirt & bag set', 'Red Labella top, skirt & bag set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 335,
       array['S','M','L'], array['Red'], 'New', true, 149, 'assets/products/red-labella-top-skirt-bag-set.jpg'
where not exists (select 1 from public.products where name = 'Red Labella top, skirt & bag set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'White bandeau & orange pleated maxi skirt', 'White bandeau & orange pleated maxi skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 330,
       array['S','M','L'], array['White', 'Orange'], 'New', true, 150, 'assets/products/white-bandeau-orange-pleated-maxi-skirt.jpg'
where not exists (select 1 from public.products where name = 'White bandeau & orange pleated maxi skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Green New York sweatshirt & orange pleated skirt', 'Green New York sweatshirt & orange pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 350,
       array['S','M','L'], array['Green', 'Orange'], 'New', true, 151, 'assets/products/green-new-york-sweatshirt-orange-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Green New York sweatshirt & orange pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White feather-trim bodycon dress', 'White feather-trim bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 210,
       array['S','M','L'], array['White'], 'New', true, 152, 'assets/products/white-feather-trim-bodycon-dress.jpg'
where not exists (select 1 from public.products where name = 'White feather-trim bodycon dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Light-blue denim shorts pair', 'Light-blue denim shorts pair. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 265,
       array['S','M','L'], array['Blue'], 'New', true, 153, 'assets/products/light-blue-denim-shorts-pair.jpg'
where not exists (select 1 from public.products where name = 'Light-blue denim shorts pair');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Denim sleeveless jacket & shorts set', 'Denim sleeveless jacket & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 180,
       array['S','M','L'], array['Multi'], 'New', true, 154, 'assets/products/denim-sleeveless-jacket-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Denim sleeveless jacket & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black cropped cardigan & denim skirt set', 'Black cropped cardigan & denim skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 325,
       array['S','M','L'], array['Black'], 'New', true, 155, 'assets/products/black-cropped-cardigan-denim-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Black cropped cardigan & denim skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Blue 89 sweatshirt & white pleated skirt', 'Blue 89 sweatshirt & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 375,
       array['S','M','L'], array['White', 'Blue'], 'New', true, 156, 'assets/products/blue-89-sweatshirt-white-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Blue 89 sweatshirt & white pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black Stanford top & check skirt set', 'Black Stanford top & check skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 170,
       array['S','M','L'], array['Black'], 'New', true, 157, 'assets/products/black-stanford-top-check-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Black Stanford top & check skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Black lace top & black maxi skirt set', 'Black lace top & black maxi skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 330,
       array['S','M','L'], array['Black'], 'New', true, 158, 'assets/products/black-lace-top-black-maxi-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Black lace top & black maxi skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Green bow-print oversized tee', 'Green bow-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 165,
       array['S','M','L'], array['Green'], 'New', true, 159, 'assets/products/green-bow-print-oversized-tee.jpg'
where not exists (select 1 from public.products where name = 'Green bow-print oversized tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black butterfly-print cargo trousers', 'Black butterfly-print cargo trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.', 345,
       array['S','M','L'], array['Black'], 'New', true, 160, 'assets/products/black-butterfly-print-cargo-trousers.jpg'
where not exists (select 1 from public.products where name = 'Black butterfly-print cargo trousers');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black New York 16 tee & white pleated skirt', 'Black New York 16 tee & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 215,
       array['S','M','L'], array['White', 'Black'], 'New', true, 161, 'assets/products/black-new-york-16-tee-white-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Black New York 16 tee & white pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Solid sleeveless dresses (purple / pink / lilac)', 'Solid sleeveless dresses (purple / pink / lilac). An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 305,
       array['S','M','L'], array['Pink', 'Purple'], 'New', true, 162, 'assets/products/solid-sleeveless-dresses-purple-pink-lilac.jpg'
where not exists (select 1 from public.products where name = 'Solid sleeveless dresses (purple / pink / lilac)');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink hoodie & wide trouser co-ord', 'Pink hoodie & wide trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 365,
       array['S','M','L'], array['Pink'], 'New', true, 163, 'assets/products/pink-hoodie-wide-trouser-co-ord.jpg'
where not exists (select 1 from public.products where name = 'Pink hoodie & wide trouser co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Cut-out bodycon dress (black / mustard)', 'Cut-out bodycon dress (black / mustard). An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 320,
       array['S','M','L'], array['Black', 'Mustard'], 'New', true, 164, 'assets/products/cut-out-bodycon-dress-black-mustard.jpg'
where not exists (select 1 from public.products where name = 'Cut-out bodycon dress (black / mustard)');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red hoodie & distressed jeans set', 'Red hoodie & distressed jeans set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 285,
       array['S','M','L'], array['Red'], 'New', true, 165, 'assets/products/red-hoodie-distressed-jeans-set.jpg'
where not exists (select 1 from public.products where name = 'Red hoodie & distressed jeans set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink fringe-trim dress', 'Pink fringe-trim dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 395,
       array['S','M','L'], array['Pink'], 'New', true, 166, 'assets/products/pink-fringe-trim-dress.jpg'
where not exists (select 1 from public.products where name = 'Pink fringe-trim dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black 23 tee & blue pleated skirt set', 'Black 23 tee & blue pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 250,
       array['S','M','L'], array['Black', 'Blue'], 'New', true, 167, 'assets/products/black-23-tee-blue-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Black 23 tee & blue pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink draped bodycon dress', 'Pink draped bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 295,
       array['S','M','L'], array['Pink'], 'New', true, 168, 'assets/products/pink-draped-bodycon-dress.jpg'
where not exists (select 1 from public.products where name = 'Pink draped bodycon dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Yellow one-shoulder top, shorts & cap set', 'Yellow one-shoulder top, shorts & cap set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 335,
       array['S','M','L'], array['Yellow'], 'New', true, 169, 'assets/products/yellow-one-shoulder-top-shorts-cap-set.jpg'
where not exists (select 1 from public.products where name = 'Yellow one-shoulder top, shorts & cap set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Deep-V pink mini dress', 'Deep-V pink mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 295,
       array['S','M','L'], array['Pink'], 'New', true, 170, 'assets/products/deep-v-pink-mini-dress.jpg'
where not exists (select 1 from public.products where name = 'Deep-V pink mini dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Lilac photo-print tee set with cap & bag', 'Lilac photo-print tee set with cap & bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 265,
       array['S','M','L'], array['Lilac'], 'New', true, 171, 'assets/products/lilac-photo-print-tee-set-with-cap-bag.jpg'
where not exists (select 1 from public.products where name = 'Lilac photo-print tee set with cap & bag');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Two-pack bandeau & shorts (black / pink)', 'Two-pack bandeau & shorts (black / pink). A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 245,
       array['S','M','L'], array['Black', 'Pink'], 'New', true, 172, 'assets/products/two-pack-bandeau-shorts-black-pink.jpg'
where not exists (select 1 from public.products where name = 'Two-pack bandeau & shorts (black / pink)');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black polo top & wide jeans set', 'Black polo top & wide jeans set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 225,
       array['S','M','L'], array['Black'], 'New', true, 173, 'assets/products/black-polo-top-wide-jeans-set.jpg'
where not exists (select 1 from public.products where name = 'Black polo top & wide jeans set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink 23 print cargo trousers', 'Pink 23 print cargo trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.', 400,
       array['S','M','L'], array['Pink'], 'New', true, 174, 'assets/products/pink-23-print-cargo-trousers.jpg'
where not exists (select 1 from public.products where name = 'Pink 23 print cargo trousers');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Spongebob white tee & denim skirt', 'Spongebob white tee & denim skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 205,
       array['S','M','L'], array['White'], 'New', true, 175, 'assets/products/spongebob-white-tee-denim-skirt.jpg'
where not exists (select 1 from public.products where name = 'Spongebob white tee & denim skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black tee set with red cap & bag', 'Black tee set with red cap & bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 370,
       array['S','M','L'], array['Black', 'Red'], 'New', true, 176, 'assets/products/black-tee-set-with-red-cap-bag.jpg'
where not exists (select 1 from public.products where name = 'Black tee set with red cap & bag');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black tee set with pink cap & bag', 'Black tee set with pink cap & bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 395,
       array['S','M','L'], array['Black', 'Pink'], 'New', true, 177, 'assets/products/black-tee-set-with-pink-cap-bag.jpg'
where not exists (select 1 from public.products where name = 'Black tee set with pink cap & bag');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Sage shirt-jacket & pleated skirt set', 'Sage shirt-jacket & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 225,
       array['S','M','L'], array['Sage'], 'New', true, 178, 'assets/products/sage-shirt-jacket-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Sage shirt-jacket & pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Orange top & white skirt set with bag', 'Orange top & white skirt set with bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 175,
       array['S','M','L'], array['White', 'Orange'], 'New', true, 179, 'assets/products/orange-top-white-skirt-set-with-bag.jpg'
where not exists (select 1 from public.products where name = 'Orange top & white skirt set with bag');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Grey hello kitty sweatshirt & white skirt', 'Grey hello kitty sweatshirt & white skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 330,
       array['S','M','L'], array['White', 'Grey'], 'New', true, 180, 'assets/products/grey-hello-kitty-sweatshirt-white-skirt.jpg'
where not exists (select 1 from public.products where name = 'Grey hello kitty sweatshirt & white skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Girl-print white sweatshirt', 'Girl-print white sweatshirt. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 245,
       array['S','M','L'], array['White'], 'New', true, 181, 'assets/products/girl-print-white-sweatshirt.jpg'
where not exists (select 1 from public.products where name = 'Girl-print white sweatshirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Blue fishnet halter maxi dress', 'Blue fishnet halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 315,
       array['S','M','L'], array['Blue'], 'New', true, 182, 'assets/products/blue-fishnet-halter-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Blue fishnet halter maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White harlem 17 tee set with cap', 'White harlem 17 tee set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 305,
       array['S','M','L'], array['White'], 'New', true, 183, 'assets/products/white-harlem-17-tee-set-with-cap.jpg'
where not exists (select 1 from public.products where name = 'White harlem 17 tee set with cap');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Blue marble-print bodycon dress', 'Blue marble-print bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 255,
       array['S','M','L'], array['Blue'], 'New', true, 184, 'assets/products/blue-marble-print-bodycon-dress.jpg'
where not exists (select 1 from public.products where name = 'Blue marble-print bodycon dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Distressed wide-leg jeans', 'Distressed wide-leg jeans. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.', 380,
       array['S','M','L'], array['Multi'], 'New', true, 185, 'assets/products/distressed-wide-leg-jeans.jpg'
where not exists (select 1 from public.products where name = 'Distressed wide-leg jeans');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White love-print trousers', 'White love-print trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.', 290,
       array['S','M','L'], array['White'], 'New', true, 186, 'assets/products/white-love-print-trousers.jpg'
where not exists (select 1 from public.products where name = 'White love-print trousers');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Contrast-trim tees (4 colours)', 'Contrast-trim tees (4 colours). A quick-styling layer from the September market drop, photographed exactly as it arrives.', 240,
       array['S','M','L'], array['Multi'], 'New', true, 187, 'assets/products/contrast-trim-tees-4-colours.jpg'
where not exists (select 1 from public.products where name = 'Contrast-trim tees (4 colours)');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black & pink cargo trousers pair with bag', 'Black & pink cargo trousers pair with bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 340,
       array['S','M','L'], array['Black', 'Pink'], 'New', true, 188, 'assets/products/black-pink-cargo-trousers-pair-with-bag.jpg'
where not exists (select 1 from public.products where name = 'Black & pink cargo trousers pair with bag');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Green shirt & wide trouser co-ord', 'Green shirt & wide trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 170,
       array['S','M','L'], array['Green'], 'New', true, 189, 'assets/products/green-shirt-wide-trouser-co-ord.jpg'
where not exists (select 1 from public.products where name = 'Green shirt & wide trouser co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'White cut-out maxi dress', 'White cut-out maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 185,
       array['S','M','L'], array['White'], 'New', true, 190, 'assets/products/white-cut-out-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'White cut-out maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Brown satin halter mini dress', 'Brown satin halter mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 310,
       array['S','M','L'], array['Brown'], 'New', true, 191, 'assets/products/brown-satin-halter-mini-dress.jpg'
where not exists (select 1 from public.products where name = 'Brown satin halter mini dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Pink halter maxi dress', 'Pink halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 280,
       array['S','M','L'], array['Pink'], 'New', true, 192, 'assets/products/pink-halter-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Pink halter maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Beige photo-print tee (shop rail shot)', 'Beige photo-print tee (shop rail shot). A quick-styling layer from the September market drop, photographed exactly as it arrives.', 200,
       array['S','M','L'], array['Beige'], 'New', true, 193, 'assets/products/beige-photo-print-tee-shop-rail-shot.jpg'
where not exists (select 1 from public.products where name = 'Beige photo-print tee (shop rail shot)');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black tee & check skirt set', 'Black tee & check skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 390,
       array['S','M','L'], array['Black'], 'New', true, 194, 'assets/products/black-tee-check-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Black tee & check skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink smurf hoodie & white pleated skirt', 'Pink smurf hoodie & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 255,
       array['S','M','L'], array['White', 'Pink'], 'New', true, 195, 'assets/products/pink-smurf-hoodie-white-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Pink smurf hoodie & white pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Green sweatshirt & white mini skirt', 'Green sweatshirt & white mini skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 195,
       array['S','M','L'], array['White', 'Green'], 'New', true, 196, 'assets/products/green-sweatshirt-white-mini-skirt.jpg'
where not exists (select 1 from public.products where name = 'Green sweatshirt & white mini skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red spaghetti-strap bodycon dress', 'Red spaghetti-strap bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 305,
       array['S','M','L'], array['Red'], 'New', true, 197, 'assets/products/red-spaghetti-strap-bodycon-dress.jpg'
where not exists (select 1 from public.products where name = 'Red spaghetti-strap bodycon dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink butterfly-print oversized tee', 'Pink butterfly-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 280,
       array['S','M','L'], array['Pink'], 'New', true, 198, 'assets/products/pink-butterfly-print-oversized-tee.jpg'
where not exists (select 1 from public.products where name = 'Pink butterfly-print oversized tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Distressed denim mini skirt', 'Distressed denim mini skirt. A wardrobe-mixing skirt from the September market drop, photographed exactly as it arrives.', 160,
       array['S','M','L'], array['Multi'], 'New', true, 199, 'assets/products/distressed-denim-mini-skirt.jpg'
where not exists (select 1 from public.products where name = 'Distressed denim mini skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black-white leaf-print shirt & shorts set', 'Black-white leaf-print shirt & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 360,
       array['S','M','L'], array['Black-white', 'White'], 'New', true, 200, 'assets/products/black-white-leaf-print-shirt-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Black-white leaf-print shirt & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Light-blue shirt & wide trouser co-ord', 'Light-blue shirt & wide trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 170,
       array['S','M','L'], array['Blue'], 'New', true, 201, 'assets/products/light-blue-shirt-wide-trouser-co-ord.jpg'
where not exists (select 1 from public.products where name = 'Light-blue shirt & wide trouser co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Olive photo-print tee set with bag & cap', 'Olive photo-print tee set with bag & cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 390,
       array['S','M','L'], array['Olive'], 'New', true, 202, 'assets/products/olive-photo-print-tee-set-with-bag-cap.jpg'
where not exists (select 1 from public.products where name = 'Olive photo-print tee set with bag & cap');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Strawberry sweatshirt & red pleated skirt', 'Strawberry sweatshirt & red pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 325,
       array['S','M','L'], array['Red'], 'New', true, 203, 'assets/products/strawberry-sweatshirt-red-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Strawberry sweatshirt & red pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink shrug, top & denim shorts set', 'Pink shrug, top & denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 330,
       array['S','M','L'], array['Pink'], 'New', true, 204, 'assets/products/pink-shrug-top-denim-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Pink shrug, top & denim shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Cow-print bra-top & skirt set', 'Cow-print bra-top & skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 400,
       array['S','M','L'], array['Multi'], 'New', true, 205, 'assets/products/cow-print-bra-top-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Cow-print bra-top & skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Grey cargo skirt & white tee set', 'Grey cargo skirt & white tee set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 250,
       array['S','M','L'], array['White', 'Grey'], 'New', true, 206, 'assets/products/grey-cargo-skirt-white-tee-set.jpg'
where not exists (select 1 from public.products where name = 'Grey cargo skirt & white tee set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red stripe tee & shorts set', 'Red stripe tee & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 255,
       array['S','M','L'], array['Red'], 'New', true, 207, 'assets/products/red-stripe-tee-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Red stripe tee & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'White textured halter maxi dress', 'White textured halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 370,
       array['S','M','L'], array['White', 'Red'], 'New', true, 208, 'assets/products/white-textured-halter-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'White textured halter maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Wine-red gradient cross-back maxi dress', 'Wine-red gradient cross-back maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 260,
       array['S','M','L'], array['Red', 'Wine'], 'New', true, 209, 'assets/products/wine-red-gradient-cross-back-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Wine-red gradient cross-back maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Red strapless maxi dress', 'Red strapless maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 340,
       array['S','M','L'], array['Red'], 'New', true, 210, 'assets/products/red-strapless-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Red strapless maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Brown Milk raglan sweatshirt & skirt set', 'Brown Milk raglan sweatshirt & skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 305,
       array['S','M','L'], array['Brown'], 'New', true, 211, 'assets/products/brown-milk-raglan-sweatshirt-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Brown Milk raglan sweatshirt & skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Check trouser, top & cap set', 'Check trouser, top & cap set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 335,
       array['S','M','L'], array['Multi'], 'New', true, 212, 'assets/products/check-trouser-top-cap-set.jpg'
where not exists (select 1 from public.products where name = 'Check trouser, top & cap set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black Betty Boop tee set with cap', 'Black Betty Boop tee set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 295,
       array['S','M','L'], array['Black'], 'New', true, 213, 'assets/products/black-betty-boop-tee-set-with-cap.jpg'
where not exists (select 1 from public.products where name = 'Black Betty Boop tee set with cap');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Blue denim strapless maxi dress', 'Blue denim strapless maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 170,
       array['S','M','L'], array['Blue'], 'New', true, 214, 'assets/products/blue-denim-strapless-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Blue denim strapless maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink top & distressed jeans set with cap', 'Pink top & distressed jeans set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 175,
       array['S','M','L'], array['Pink'], 'New', true, 215, 'assets/products/pink-top-distressed-jeans-set-with-cap.jpg'
where not exists (select 1 from public.products where name = 'Pink top & distressed jeans set with cap');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Pink strapless maxi dress', 'Pink strapless maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 235,
       array['S','M','L'], array['Pink'], 'New', true, 216, 'assets/products/pink-strapless-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Pink strapless maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'White textured halter maxi jumpsuit', 'White textured halter maxi jumpsuit. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 300,
       array['S','M','L'], array['White', 'Red'], 'New', true, 217, 'assets/products/white-textured-halter-maxi-jumpsuit.jpg'
where not exists (select 1 from public.products where name = 'White textured halter maxi jumpsuit');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Green Brooklyn sweatshirt & white pleated skirt', 'Green Brooklyn sweatshirt & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 370,
       array['S','M','L'], array['White', 'Green'], 'New', true, 218, 'assets/products/green-brooklyn-sweatshirt-white-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Green Brooklyn sweatshirt & white pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White 90 jersey & grey skirt set with cap', 'White 90 jersey & grey skirt set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 360,
       array['S','M','L'], array['White', 'Grey'], 'New', true, 219, 'assets/products/white-90-jersey-grey-skirt-set-with-cap.jpg'
where not exists (select 1 from public.products where name = 'White 90 jersey & grey skirt set with cap');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink bra-top, shorts & cap set', 'Pink bra-top, shorts & cap set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 170,
       array['S','M','L'], array['Pink'], 'New', true, 220, 'assets/products/pink-bra-top-shorts-cap-set.jpg'
where not exists (select 1 from public.products where name = 'Pink bra-top, shorts & cap set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Orange corset top & denim shorts set', 'Orange corset top & denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 165,
       array['S','M','L'], array['Orange'], 'New', true, 221, 'assets/products/orange-corset-top-denim-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Orange corset top & denim shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Orange shrug, top & green pleated maxi skirt', 'Orange shrug, top & green pleated maxi skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 380,
       array['S','M','L'], array['Green', 'Orange'], 'New', true, 222, 'assets/products/orange-shrug-top-green-pleated-maxi-skirt.jpg'
where not exists (select 1 from public.products where name = 'Orange shrug, top & green pleated maxi skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Grey bandeau & shorts set', 'Grey bandeau & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 370,
       array['S','M','L'], array['Grey'], 'New', true, 223, 'assets/products/grey-bandeau-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Grey bandeau & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black-white stripe shirt & shorts set', 'Black-white stripe shirt & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 245,
       array['S','M','L'], array['Black-white', 'White'], 'New', true, 224, 'assets/products/black-white-stripe-shirt-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Black-white stripe shirt & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red top & white wide-leg trousers (model shot)', 'Red top & white wide-leg trousers (model shot). A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 355,
       array['S','M','L'], array['White', 'Red'], 'New', true, 225, 'assets/products/red-top-white-wide-leg-trousers-model-shot.jpg'
where not exists (select 1 from public.products where name = 'Red top & white wide-leg trousers (model shot)');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Cherry sweatshirt & red check skirt', 'Cherry sweatshirt & red check skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 330,
       array['S','M','L'], array['Red'], 'New', true, 226, 'assets/products/cherry-sweatshirt-red-check-skirt.jpg'
where not exists (select 1 from public.products where name = 'Cherry sweatshirt & red check skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White polo dress with cap', 'White polo dress with cap. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 365,
       array['S','M','L'], array['White'], 'New', true, 227, 'assets/products/white-polo-dress-with-cap.jpg'
where not exists (select 1 from public.products where name = 'White polo dress with cap');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Light-blue lace shrug & maxi skirt set', 'Light-blue lace shrug & maxi skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 290,
       array['S','M','L'], array['Blue'], 'New', true, 228, 'assets/products/light-blue-lace-shrug-maxi-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Light-blue lace shrug & maxi skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink hoodie & pleated skirt set with chain', 'Pink hoodie & pleated skirt set with chain. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 240,
       array['S','M','L'], array['Pink'], 'New', true, 229, 'assets/products/pink-hoodie-pleated-skirt-set-with-chain.jpg'
where not exists (select 1 from public.products where name = 'Pink hoodie & pleated skirt set with chain');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black butterfly-embroidered wide trousers', 'Black butterfly-embroidered wide trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.', 375,
       array['S','M','L'], array['Black', 'Red'], 'New', true, 230, 'assets/products/black-butterfly-embroidered-wide-trousers.jpg'
where not exists (select 1 from public.products where name = 'Black butterfly-embroidered wide trousers');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White textured strapless dress', 'White textured strapless dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 270,
       array['S','M','L'], array['White', 'Red'], 'New', true, 231, 'assets/products/white-textured-strapless-dress.jpg'
where not exists (select 1 from public.products where name = 'White textured strapless dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White Labella top, skirt & bag set', 'White Labella top, skirt & bag set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 360,
       array['S','M','L'], array['White'], 'New', true, 232, 'assets/products/white-labella-top-skirt-bag-set.jpg'
where not exists (select 1 from public.products where name = 'White Labella top, skirt & bag set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Lilac bow halter dress', 'Lilac bow halter dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 260,
       array['S','M','L'], array['Lilac'], 'New', true, 233, 'assets/products/lilac-bow-halter-dress.jpg'
where not exists (select 1 from public.products where name = 'Lilac bow halter dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black halter top & shorts set with cap', 'Black halter top & shorts set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 155,
       array['S','M','L'], array['Black'], 'New', true, 234, 'assets/products/black-halter-top-shorts-set-with-cap.jpg'
where not exists (select 1 from public.products where name = 'Black halter top & shorts set with cap');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Blue denim jacket & skirt set', 'Blue denim jacket & skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 295,
       array['S','M','L'], array['Blue'], 'New', true, 235, 'assets/products/blue-denim-jacket-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Blue denim jacket & skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Black halter maxi dress', 'Black halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 260,
       array['S','M','L'], array['Black'], 'New', true, 236, 'assets/products/black-halter-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Black halter maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Light-blue wide-leg cargo jeans & top set', 'Light-blue wide-leg cargo jeans & top set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 200,
       array['S','M','L'], array['Blue'], 'New', true, 237, 'assets/products/light-blue-wide-leg-cargo-jeans-top-set.jpg'
where not exists (select 1 from public.products where name = 'Light-blue wide-leg cargo jeans & top set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red M sweatshirt & black pleated skirt', 'Red M sweatshirt & black pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 345,
       array['S','M','L'], array['Black', 'Red'], 'New', true, 238, 'assets/products/red-m-sweatshirt-black-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Red M sweatshirt & black pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Orange Houston tee & white pleated skirt set', 'Orange Houston tee & white pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 185,
       array['S','M','L'], array['White', 'Orange'], 'New', true, 239, 'assets/products/orange-houston-tee-white-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Orange Houston tee & white pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Orange fishnet halter maxi dress', 'Orange fishnet halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 305,
       array['S','M','L'], array['Orange'], 'New', true, 240, 'assets/products/orange-fishnet-halter-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Orange fishnet halter maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White one-shoulder top & shorts set', 'White one-shoulder top & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 165,
       array['S','M','L'], array['White'], 'New', true, 241, 'assets/products/white-one-shoulder-top-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'White one-shoulder top & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink Calvin tee & shorts set', 'Pink Calvin tee & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 215,
       array['S','M','L'], array['Pink'], 'New', true, 242, 'assets/products/pink-calvin-tee-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Pink Calvin tee & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Blue alo shirt & pleated skirt set with bag', 'Blue alo shirt & pleated skirt set with bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 395,
       array['S','M','L'], array['Blue'], 'New', true, 243, 'assets/products/blue-alo-shirt-pleated-skirt-set-with-bag.jpg'
where not exists (select 1 from public.products where name = 'Blue alo shirt & pleated skirt set with bag');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White cargo trousers pair', 'White cargo trousers pair. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.', 240,
       array['S','M','L'], array['White'], 'New', true, 244, 'assets/products/white-cargo-trousers-pair.jpg'
where not exists (select 1 from public.products where name = 'White cargo trousers pair');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black angel top & red check skirt', 'Black angel top & red check skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 190,
       array['S','M','L'], array['Black', 'Red'], 'New', true, 245, 'assets/products/black-angel-top-red-check-skirt.jpg'
where not exists (select 1 from public.products where name = 'Black angel top & red check skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Yellow pleated mini dress', 'Yellow pleated mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 385,
       array['S','M','L'], array['Yellow'], 'New', true, 246, 'assets/products/yellow-pleated-mini-dress.jpg'
where not exists (select 1 from public.products where name = 'Yellow pleated mini dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink hoodie & pleated skirt set', 'Pink hoodie & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 225,
       array['S','M','L'], array['Pink'], 'New', true, 247, 'assets/products/pink-hoodie-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Pink hoodie & pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Wine draped bodycon dress', 'Wine draped bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 275,
       array['S','M','L'], array['Wine'], 'New', true, 248, 'assets/products/wine-draped-bodycon-dress.jpg'
where not exists (select 1 from public.products where name = 'Wine draped bodycon dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Brown fishnet halter maxi dress', 'Brown fishnet halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 275,
       array['S','M','L'], array['Brown'], 'New', true, 249, 'assets/products/brown-fishnet-halter-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Brown fishnet halter maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Black abaya-style dress & hijab set', 'Black abaya-style dress & hijab set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 305,
       array['S','M','L'], array['Black'], 'New', true, 251, 'assets/products/black-abaya-style-dress-hijab-set.jpg'
where not exists (select 1 from public.products where name = 'Black abaya-style dress & hijab set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink top & light denim shorts set', 'Pink top & light denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 175,
       array['S','M','L'], array['Pink'], 'New', true, 252, 'assets/products/pink-top-light-denim-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Pink top & light denim shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Beige cartoon-print oversized tee', 'Beige cartoon-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 200,
       array['S','M','L'], array['Beige'], 'New', true, 253, 'assets/products/beige-cartoon-print-oversized-tee.jpg'
where not exists (select 1 from public.products where name = 'Beige cartoon-print oversized tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pleated mini skirts (black & camel)', 'Pleated mini skirts (black & camel). A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 290,
       array['S','M','L'], array['Black', 'Camel'], 'New', true, 254, 'assets/products/pleated-mini-skirts-black-camel.jpg'
where not exists (select 1 from public.products where name = 'Pleated mini skirts (black & camel)');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White photo-print tee & grey cargo trouser set', 'White photo-print tee & grey cargo trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 275,
       array['S','M','L'], array['White', 'Grey'], 'New', true, 255, 'assets/products/white-photo-print-tee-grey-cargo-trouser-set.jpg'
where not exists (select 1 from public.products where name = 'White photo-print tee & grey cargo trouser set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Sage photo-print oversized sweatshirt', 'Sage photo-print oversized sweatshirt. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 325,
       array['S','M','L'], array['Sage'], 'New', true, 256, 'assets/products/sage-photo-print-oversized-sweatshirt.jpg'
where not exists (select 1 from public.products where name = 'Sage photo-print oversized sweatshirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red jacket, trouser & bag tracksuit set', 'Red jacket, trouser & bag tracksuit set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 235,
       array['S','M','L'], array['Red'], 'New', true, 257, 'assets/products/red-jacket-trouser-bag-tracksuit-set.jpg'
where not exists (select 1 from public.products where name = 'Red jacket, trouser & bag tracksuit set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Tweety cream oversized tee', 'Tweety cream oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 190,
       array['S','M','L'], array['Cream'], 'New', true, 258, 'assets/products/tweety-cream-oversized-tee.jpg'
where not exists (select 1 from public.products where name = 'Tweety cream oversized tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Red tee & shorts co-ord', 'Red tee & shorts co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 285,
       array['S','M','L'], array['Red'], 'New', true, 259, 'assets/products/red-tee-shorts-co-ord.jpg'
where not exists (select 1 from public.products where name = 'Red tee & shorts co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black 86 tee & white pleated skirt', 'Black 86 tee & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 325,
       array['S','M','L'], array['White', 'Black'], 'New', true, 260, 'assets/products/black-86-tee-white-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Black 86 tee & white pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Cream serpico sweatshirt & brown pleated skirt', 'Cream serpico sweatshirt & brown pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 235,
       array['S','M','L'], array['Brown', 'Cream'], 'New', true, 261, 'assets/products/cream-serpico-sweatshirt-brown-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Cream serpico sweatshirt & brown pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Blue hooded cape & pleated skirt set', 'Blue hooded cape & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 375,
       array['S','M','L'], array['Blue'], 'New', true, 262, 'assets/products/blue-hooded-cape-pleated-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Blue hooded cape & pleated skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Green 8E sweatshirt & yellow pleated skirt', 'Green 8E sweatshirt & yellow pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 280,
       array['S','M','L'], array['Green', 'Yellow'], 'New', true, 263, 'assets/products/green-8e-sweatshirt-yellow-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Green 8E sweatshirt & yellow pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Hello Kitty pink tee', 'Hello Kitty pink tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 260,
       array['S','M','L'], array['Pink'], 'New', true, 264, 'assets/products/hello-kitty-pink-tee.jpg'
where not exists (select 1 from public.products where name = 'Hello Kitty pink tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink bear hoodie & camel pleated skirt', 'Pink bear hoodie & camel pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 365,
       array['S','M','L'], array['Pink', 'Camel'], 'New', true, 265, 'assets/products/pink-bear-hoodie-camel-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Pink bear hoodie & camel pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Powerpuff Girls pink tee', 'Powerpuff Girls pink tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 270,
       array['S','M','L'], array['Pink'], 'New', true, 266, 'assets/products/powerpuff-girls-pink-tee.jpg'
where not exists (select 1 from public.products where name = 'Powerpuff Girls pink tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Yellow peto hoodie & red pleated skirt', 'Yellow peto hoodie & red pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 220,
       array['S','M','L'], array['Red', 'Yellow'], 'New', true, 267, 'assets/products/yellow-peto-hoodie-red-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Yellow peto hoodie & red pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White contrast polo & denim shorts set', 'White contrast polo & denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 195,
       array['S','M','L'], array['White'], 'New', true, 268, 'assets/products/white-contrast-polo-denim-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'White contrast polo & denim shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White alo tee & pink wide trouser set', 'White alo tee & pink wide trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 175,
       array['S','M','L'], array['White', 'Pink'], 'New', true, 269, 'assets/products/white-alo-tee-pink-wide-trouser-set.jpg'
where not exists (select 1 from public.products where name = 'White alo tee & pink wide trouser set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White china sweatshirt & grey pleated skirt', 'White china sweatshirt & grey pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 205,
       array['S','M','L'], array['White', 'Grey'], 'New', true, 270, 'assets/products/white-china-sweatshirt-grey-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'White china sweatshirt & grey pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Comptons sweatshirt & check skirt set', 'Comptons sweatshirt & check skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 195,
       array['S','M','L'], array['Multi'], 'New', true, 271, 'assets/products/comptons-sweatshirt-check-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Comptons sweatshirt & check skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black California sweatshirt & check skirt', 'Black California sweatshirt & check skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 220,
       array['S','M','L'], array['Black'], 'New', true, 272, 'assets/products/black-california-sweatshirt-check-skirt.jpg'
where not exists (select 1 from public.products where name = 'Black California sweatshirt & check skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink hoodie, shorts & sneakers set', 'Pink hoodie, shorts & sneakers set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 360,
       array['S','M','L'], array['Pink'], 'New', true, 273, 'assets/products/pink-hoodie-shorts-sneakers-set.jpg'
where not exists (select 1 from public.products where name = 'Pink hoodie, shorts & sneakers set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Olive zip jacket & wide trouser set', 'Olive zip jacket & wide trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 220,
       array['S','M','L'], array['Olive'], 'New', true, 274, 'assets/products/olive-zip-jacket-wide-trouser-set.jpg'
where not exists (select 1 from public.products where name = 'Olive zip jacket & wide trouser set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Olive gradient maxi dress', 'Olive gradient maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 150,
       array['S','M','L'], array['Olive'], 'New', true, 275, 'assets/products/olive-gradient-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Olive gradient maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Stitch lilac tee set with cap', 'Stitch lilac tee set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 305,
       array['S','M','L'], array['Lilac'], 'New', true, 276, 'assets/products/stitch-lilac-tee-set-with-cap.jpg'
where not exists (select 1 from public.products where name = 'Stitch lilac tee set with cap');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black hoodie & trouser tracksuit set', 'Black hoodie & trouser tracksuit set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 335,
       array['S','M','L'], array['Black'], 'New', true, 277, 'assets/products/black-hoodie-trouser-tracksuit-set.jpg'
where not exists (select 1 from public.products where name = 'Black hoodie & trouser tracksuit set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink baby-girl top & denim cargo shorts set', 'Pink baby-girl top & denim cargo shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 205,
       array['S','M','L'], array['Pink'], 'New', true, 278, 'assets/products/pink-baby-girl-top-denim-cargo-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'Pink baby-girl top & denim cargo shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Lilac shirt-dress with bag', 'Lilac shirt-dress with bag. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 230,
       array['S','M','L'], array['Lilac'], 'New', true, 279, 'assets/products/lilac-shirt-dress-with-bag.jpg'
where not exists (select 1 from public.products where name = 'Lilac shirt-dress with bag');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Leopard & solid pleated skirt pack', 'Leopard & solid pleated skirt pack. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 240,
       array['S','M','L'], array['Multi'], 'New', true, 280, 'assets/products/leopard-solid-pleated-skirt-pack.jpg'
where not exists (select 1 from public.products where name = 'Leopard & solid pleated skirt pack');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Grey hoodie & wide trouser co-ord', 'Grey hoodie & wide trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 150,
       array['S','M','L'], array['Grey'], 'New', true, 281, 'assets/products/grey-hoodie-wide-trouser-co-ord.jpg'
where not exists (select 1 from public.products where name = 'Grey hoodie & wide trouser co-ord');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White heart-print sweatshirt', 'White heart-print sweatshirt. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 195,
       array['S','M','L'], array['White'], 'New', true, 282, 'assets/products/white-heart-print-sweatshirt.jpg'
where not exists (select 1 from public.products where name = 'White heart-print sweatshirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Purple nike two-piece & sneaker set', 'Purple nike two-piece & sneaker set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 280,
       array['S','M','L'], array['Purple'], 'New', true, 283, 'assets/products/purple-nike-two-piece-sneaker-set.jpg'
where not exists (select 1 from public.products where name = 'Purple nike two-piece & sneaker set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Blue polo shirt & skirt set', 'Blue polo shirt & skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 320,
       array['S','M','L'], array['Blue'], 'New', true, 284, 'assets/products/blue-polo-shirt-skirt-set.jpg'
where not exists (select 1 from public.products where name = 'Blue polo shirt & skirt set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Wine velour hoodie & trouser set', 'Wine velour hoodie & trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 265,
       array['S','M','L'], array['Wine'], 'New', true, 285, 'assets/products/wine-velour-hoodie-trouser-set.jpg'
where not exists (select 1 from public.products where name = 'Wine velour hoodie & trouser set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White floral shirt & shorts set', 'White floral shirt & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 345,
       array['S','M','L'], array['White'], 'New', true, 286, 'assets/products/white-floral-shirt-shorts-set.jpg'
where not exists (select 1 from public.products where name = 'White floral shirt & shorts set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'White bulls top & red pleated skirt', 'White bulls top & red pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 330,
       array['S','M','L'], array['White', 'Red'], 'New', true, 287, 'assets/products/white-bulls-top-red-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'White bulls top & red pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Black sweatshirt & yellow pleated skirt', 'Black sweatshirt & yellow pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.', 250,
       array['S','M','L'], array['Black', 'Yellow'], 'New', true, 288, 'assets/products/black-sweatshirt-yellow-pleated-skirt.jpg'
where not exists (select 1 from public.products where name = 'Black sweatshirt & yellow pleated skirt');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'modest', 'Green ruched maxi dress', 'Green ruched maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 190,
       array['S','M','L'], array['Green'], 'New', true, 289, 'assets/products/green-ruched-maxi-dress.jpg'
where not exists (select 1 from public.products where name = 'Green ruched maxi dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Green Q heart-print oversized tee', 'Green Q heart-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.', 370,
       array['S','M','L'], array['Green'], 'New', true, 290, 'assets/products/green-q-heart-print-oversized-tee.jpg'
where not exists (select 1 from public.products where name = 'Green Q heart-print oversized tee');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Yellow ruffle tiered dress', 'Yellow ruffle tiered dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.', 310,
       array['S','M','L'], array['Red', 'Yellow'], 'New', true, 291, 'assets/products/yellow-ruffle-tiered-dress.jpg'
where not exists (select 1 from public.products where name = 'Yellow ruffle tiered dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
select 'fashion', 'streetwear', 'Pink butterfly cargo trousers', 'Pink butterfly cargo trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.', 345,
       array['S','M','L'], array['Pink'], 'New', true, 292, 'assets/products/pink-butterfly-cargo-trousers.jpg'
where not exists (select 1 from public.products where name = 'Pink butterfly cargo trousers');
