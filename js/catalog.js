// Product catalog.
// - When Supabase is configured, products are read from the public.products table.
// - When Supabase is not configured (demo mode), a matching local placeholder set is used.

import { CONFIG, isDemoMode } from "./config.js";
import { stringId } from "./utils.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

const LOCAL_PRODUCTS = [
  // Real stock only. No placeholder products ship with the site any more;
  // photos arrive through Seller Center (Supabase Storage) or assets/products/.

  // Real stock only. No placeholder products ship with the site any more;
  // photos arrive through Seller Center (Supabase Storage) or assets/products/.
  {
    id: "30",
    dept: "fashion",
    collection: "streetwear",
    name: "Olive Dotted Fringe Two-Piece Set",
    description: "A ribbed olive two-piece with tiny white dots: an easy round-neck top and a fringe-cut mini skirt that moves when you do.",
    price_ghs: 220,
    sizes: ["S", "M", "L"],
    colors: ["Olive"],
    badge: "New",
    in_stock: true,
    sort_order: 30,
    image: "assets/products/olive-dotted-fringe-two-piece-set.jpg"
  },
  {
    id: "31",
    dept: "fashion",
    collection: "streetwear",
    name: "Striped Tee & Sparkle Skirt Set",
    description: "A white tee with fine black stripes and a fringed neckline, paired with a black sparkle pencil skirt for day-to-night.",
    price_ghs: 190,
    sizes: ["S", "M", "L"],
    colors: ["Black / White"],
    badge: "New",
    in_stock: true,
    sort_order: 31,
    image: "assets/products/striped-tee-sparkle-skirt-set.jpg"
  },
  {
    id: "32",
    dept: "fashion",
    collection: "modest",
    name: "Coral Floral Belted Maxi Dress",
    description: "A breezy white maxi covered in coral florals, with a matching self-tie belt and a soft pleated skirt with a front split.",
    price_ghs: 240,
    sizes: ["M", "L", "XL"],
    colors: ["Coral"],
    badge: "New",
    in_stock: true,
    sort_order: 32,
    image: "assets/products/coral-floral-belted-maxi-dress.jpg"
  },
  {
    id: "33",
    dept: "fashion",
    collection: "streetwear",
    name: "Turquoise Stripe Applique Midi Dress",
    description: "A ribbed sleeveless midi in bold turquoise and white stripes, with pearl flower appliques and a keyhole neckline.",
    price_ghs: 210,
    sizes: ["S", "M", "L"],
    colors: ["Turquoise"],
    badge: "New",
    in_stock: true,
    sort_order: 33,
    image: "assets/products/turquoise-stripe-applique-midi-dress.jpg"
  },
  {
    id: "100",
    dept: "fashion",
    collection: "streetwear",
    name: "Alo white tee & brown pleated skirt set",
    description: "Alo white tee & brown pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 250,
    sizes: ["S", "M", "L"],
    colors: ["White", "Brown"],
    badge: "New",
    in_stock: true,
    sort_order: 100,
    image: "assets/products/alo-white-tee-brown-pleated-skirt-set.jpg"
  },
  {
    id: "101",
    dept: "fashion",
    collection: "streetwear",
    name: "Lilac photo-print oversized tee",
    description: "Lilac photo-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 195,
    sizes: ["S", "M", "L"],
    colors: ["Lilac"],
    badge: "New",
    in_stock: true,
    sort_order: 101,
    image: "assets/products/lilac-photo-print-oversized-tee.jpg"
  },
  {
    id: "102",
    dept: "fashion",
    collection: "streetwear",
    name: "Red ruched halter bodycon dress",
    description: "Red ruched halter bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 275,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 102,
    image: "assets/products/red-ruched-halter-bodycon-dress.jpg"
  },
  {
    id: "103",
    dept: "fashion",
    collection: "streetwear",
    name: "Light-wash pearl denim mini skirt",
    description: "Light-wash pearl denim mini skirt. A wardrobe-mixing skirt from the September market drop, photographed exactly as it arrives.",
    price_ghs: 355,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 103,
    image: "assets/products/light-wash-pearl-denim-mini-skirt.jpg"
  },
  {
    id: "104",
    dept: "fashion",
    collection: "streetwear",
    name: "Red sweatshirt & pleated skirt set",
    description: "Red sweatshirt & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 165,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 104,
    image: "assets/products/red-sweatshirt-pleated-skirt-set.jpg"
  },
  {
    id: "105",
    dept: "fashion",
    collection: "streetwear",
    name: "Red-black striped halter dress",
    description: "Red-black striped halter dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 170,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 105,
    image: "assets/products/red-black-striped-halter-dress.jpg"
  },
  {
    id: "106",
    dept: "fashion",
    collection: "streetwear",
    name: "Black lace shrug & patchwork skirt set",
    description: "Black lace shrug & patchwork skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 320,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 106,
    image: "assets/products/black-lace-shrug-patchwork-skirt-set.jpg"
  },
  {
    id: "107",
    dept: "fashion",
    collection: "streetwear",
    name: "White tee & grey cargo trouser set",
    description: "White tee & grey cargo trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 180,
    sizes: ["S", "M", "L"],
    colors: ["White", "Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 107,
    image: "assets/products/white-tee-grey-cargo-trouser-set.jpg"
  },
  {
    id: "108",
    dept: "fashion",
    collection: "streetwear",
    name: "Wine zip jacket & wide trouser set",
    description: "Wine zip jacket & wide trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 265,
    sizes: ["S", "M", "L"],
    colors: ["Wine"],
    badge: "New",
    in_stock: true,
    sort_order: 108,
    image: "assets/products/wine-zip-jacket-wide-trouser-set.jpg"
  },
  {
    id: "109",
    dept: "fashion",
    collection: "modest",
    name: "Orange pleated maxi dress",
    description: "Orange pleated maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 335,
    sizes: ["S", "M", "L"],
    colors: ["Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 109,
    image: "assets/products/orange-pleated-maxi-dress.jpg"
  },
  {
    id: "110",
    dept: "fashion",
    collection: "streetwear",
    name: "Striped knit two-piece bodycon set",
    description: "Striped knit two-piece bodycon set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 165,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 110,
    image: "assets/products/striped-knit-two-piece-bodycon-set.jpg"
  },
  {
    id: "111",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink tee & straight-trouser co-ord",
    description: "Pink tee & straight-trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 310,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 111,
    image: "assets/products/pink-tee-straight-trouser-co-ord.jpg"
  },
  {
    id: "112",
    dept: "fashion",
    collection: "streetwear",
    name: "Brown polo top & denim shorts set",
    description: "Brown polo top & denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 215,
    sizes: ["S", "M", "L"],
    colors: ["Brown"],
    badge: "New",
    in_stock: true,
    sort_order: 112,
    image: "assets/products/brown-polo-top-denim-shorts-set.jpg"
  },
  {
    id: "113",
    dept: "fashion",
    collection: "streetwear",
    name: "Lilac bow cargo trousers & top set",
    description: "Lilac bow cargo trousers & top set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 160,
    sizes: ["S", "M", "L"],
    colors: ["Lilac"],
    badge: "New",
    in_stock: true,
    sort_order: 113,
    image: "assets/products/lilac-bow-cargo-trousers-top-set.jpg"
  },
  {
    id: "114",
    dept: "fashion",
    collection: "streetwear",
    name: "White zip-front dress with black trim",
    description: "White zip-front dress with black trim. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 175,
    sizes: ["S", "M", "L"],
    colors: ["White", "Black"],
    badge: "New",
    in_stock: true,
    sort_order: 114,
    image: "assets/products/white-zip-front-dress-with-black-trim.jpg"
  },
  {
    id: "115",
    dept: "fashion",
    collection: "streetwear",
    name: "Black hoodie & pleated skirt set with chain",
    description: "Black hoodie & pleated skirt set with chain. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 285,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 115,
    image: "assets/products/black-hoodie-pleated-skirt-set-with-chain.jpg"
  },
  {
    id: "116",
    dept: "fashion",
    collection: "streetwear",
    name: "Wine spaghetti-strap mini dress",
    description: "Wine spaghetti-strap mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 280,
    sizes: ["S", "M", "L"],
    colors: ["Wine"],
    badge: "New",
    in_stock: true,
    sort_order: 116,
    image: "assets/products/wine-spaghetti-strap-mini-dress.jpg"
  },
  {
    id: "117",
    dept: "fashion",
    collection: "streetwear",
    name: "Tom & Jerry print white tee",
    description: "Tom & Jerry print white tee. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 170,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 117,
    image: "assets/products/tom-jerry-print-white-tee.jpg"
  },
  {
    id: "118",
    dept: "fashion",
    collection: "modest",
    name: "Dark floral halter maxi dress",
    description: "Dark floral halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 225,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 118,
    image: "assets/products/dark-floral-halter-maxi-dress.jpg"
  },
  {
    id: "119",
    dept: "fashion",
    collection: "streetwear",
    name: "Animal-print long-sleeve mini dress",
    description: "Animal-print long-sleeve mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 175,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 119,
    image: "assets/products/animal-print-long-sleeve-mini-dress.jpg"
  },
  {
    id: "120",
    dept: "fashion",
    collection: "streetwear",
    name: "Grey hoodie, top & pleated skirt set",
    description: "Grey hoodie, top & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 325,
    sizes: ["S", "M", "L"],
    colors: ["Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 120,
    image: "assets/products/grey-hoodie-top-pleated-skirt-set.jpg"
  },
  {
    id: "121",
    dept: "fashion",
    collection: "streetwear",
    name: "Teddy-bear cream hoodie & brown pleated skirt",
    description: "Teddy-bear cream hoodie & brown pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 285,
    sizes: ["S", "M", "L"],
    colors: ["Brown", "Cream"],
    badge: "New",
    in_stock: true,
    sort_order: 121,
    image: "assets/products/teddy-bear-cream-hoodie-brown-pleated-skirt.jpg"
  },
  {
    id: "122",
    dept: "fashion",
    collection: "streetwear",
    name: "Striped polo-collar tee (red / black)",
    description: "Striped polo-collar tee (red / black). A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 165,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 122,
    image: "assets/products/striped-polo-collar-tee-red-black.jpg"
  },
  {
    id: "123",
    dept: "fashion",
    collection: "streetwear",
    name: "Black butterfly-print wide trousers",
    description: "Black butterfly-print wide trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 123,
    image: "assets/products/black-butterfly-print-wide-trousers.jpg"
  },
  {
    id: "124",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink alo tee & grey pleated skirt set",
    description: "Pink alo tee & grey pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 185,
    sizes: ["S", "M", "L"],
    colors: ["Pink", "Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 124,
    image: "assets/products/pink-alo-tee-grey-pleated-skirt-set.jpg"
  },
  {
    id: "125",
    dept: "fashion",
    collection: "streetwear",
    name: "Neon green halter mini dress",
    description: "Neon green halter mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 220,
    sizes: ["S", "M", "L"],
    colors: ["Neon green", "Green"],
    badge: "New",
    in_stock: true,
    sort_order: 125,
    image: "assets/products/neon-green-halter-mini-dress.jpg"
  },
  {
    id: "126",
    dept: "fashion",
    collection: "streetwear",
    name: "White lace bra-top & navy shorts set",
    description: "White lace bra-top & navy shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 350,
    sizes: ["S", "M", "L"],
    colors: ["White", "Navy"],
    badge: "New",
    in_stock: true,
    sort_order: 126,
    image: "assets/products/white-lace-bra-top-navy-shorts-set.jpg"
  },
  {
    id: "127",
    dept: "fashion",
    collection: "streetwear",
    name: "White top, colour-block shorts & cap set",
    description: "White top, colour-block shorts & cap set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 350,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 127,
    image: "assets/products/white-top-colour-block-shorts-cap-set.jpg"
  },
  {
    id: "128",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink hoodie & sweat trouser co-ord",
    description: "Pink hoodie & sweat trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 335,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 128,
    image: "assets/products/pink-hoodie-sweat-trouser-co-ord.jpg"
  },
  {
    id: "129",
    dept: "fashion",
    collection: "streetwear",
    name: "Black lace shrug & floral skirt set",
    description: "Black lace shrug & floral skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 165,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 129,
    image: "assets/products/black-lace-shrug-floral-skirt-set.jpg"
  },
  {
    id: "130",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink & white cargo trouser set",
    description: "Pink & white cargo trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["White", "Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 130,
    image: "assets/products/pink-white-cargo-trouser-set.jpg"
  },
  {
    id: "131",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink bra-top & denim mini skirt",
    description: "Pink bra-top & denim mini skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 335,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 131,
    image: "assets/products/pink-bra-top-denim-mini-skirt.jpg"
  },
  {
    id: "300",
    dept: "fashion",
    collection: "streetwear",
    name: "Blue Polka-Dot Ruffle-Hem Dress",
    description: "A blue polka-dot day dress with a ruffle hem and side ruffles, photographed at the market and cleaned for the rail.",
    price_ghs: 290,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 300,
    image: "assets/products/blue-polka-dot-ruffle-hem-dress.jpg"
  },
  {
    id: "301",
    dept: "fashion",
    collection: "streetwear",
    name: "Orange Alo Tee & Pleated Skirt Set",
    description: "An orange alo-print tee with a matching orange pleated skirt - one co-ord, many outfits.",
    price_ghs: 325,
    sizes: ["S", "M", "L"],
    colors: ["Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 301,
    image: "assets/products/orange-alo-tee-pleated-skirt-set.jpg"
  },
  {
    id: "302",
    dept: "fashion",
    collection: "streetwear",
    name: "Magenta Alo-Print Ruffle Dress",
    description: "A magenta pink alo-print dress with a ruffle hem and a belted waist that holds its shape.",
    price_ghs: 395,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 302,
    image: "assets/products/magenta-alo-print-ruffle-dress.jpg"
  },
  {
    id: "303",
    dept: "fashion",
    collection: "streetwear",
    name: "Lilac Print Belted Midi Dress",
    description: "A lilac printed midi with short sleeves and a self belt - easy office-to-evening wear.",
    price_ghs: 295,
    sizes: ["S", "M", "L"],
    colors: ["Lilac"],
    badge: "New",
    in_stock: true,
    sort_order: 303,
    image: "assets/products/lilac-print-belted-midi-dress.jpg"
  },
  {
    id: "304",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink-White Stripe Keyhole Midi Dress",
    description: "A pink and white striped sleeveless midi with a keyhole neckline and pearl flower appliques.",
    price_ghs: 290,
    sizes: ["S", "M", "L"],
    colors: ["Pink", "White"],
    badge: "New",
    in_stock: true,
    sort_order: 304,
    image: "assets/products/pink-white-stripe-keyhole-midi-dress.jpg"
  },
  {
    id: "132",
    dept: "fashion",
    collection: "modest",
    name: "Light-blue off-shoulder maxi dress",
    description: "Light-blue off-shoulder maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 275,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 132,
    image: "assets/products/light-blue-off-shoulder-maxi-dress.jpg"
  },
  {
    id: "133",
    dept: "fashion",
    collection: "streetwear",
    name: "Maroon top & trouser two-piece set",
    description: "Maroon top & trouser two-piece set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 165,
    sizes: ["S", "M", "L"],
    colors: ["Maroon"],
    badge: "New",
    in_stock: true,
    sort_order: 133,
    image: "assets/products/maroon-top-trouser-two-piece-set.jpg"
  },
  {
    id: "134",
    dept: "fashion",
    collection: "streetwear",
    name: "Red one-shoulder bodycon dress",
    description: "Red one-shoulder bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 220,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 134,
    image: "assets/products/red-one-shoulder-bodycon-dress.jpg"
  },
  {
    id: "135",
    dept: "fashion",
    collection: "streetwear",
    name: "White blazer & shorts set",
    description: "White blazer & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 160,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 135,
    image: "assets/products/white-blazer-shorts-set.jpg"
  },
  {
    id: "136",
    dept: "fashion",
    collection: "modest",
    name: "Pink textured halter maxi dress",
    description: "Pink textured halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 325,
    sizes: ["S", "M", "L"],
    colors: ["Pink", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 136,
    image: "assets/products/pink-textured-halter-maxi-dress.jpg"
  },
  {
    id: "137",
    dept: "fashion",
    collection: "streetwear",
    name: "Blue satin slip mini dress",
    description: "Blue satin slip mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 190,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 137,
    image: "assets/products/blue-satin-slip-mini-dress.jpg"
  },
  {
    id: "138",
    dept: "fashion",
    collection: "streetwear",
    name: "White hoodie & trouser co-ord",
    description: "White hoodie & trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 240,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 138,
    image: "assets/products/white-hoodie-trouser-co-ord.jpg"
  },
  {
    id: "139",
    dept: "fashion",
    collection: "streetwear",
    name: "Argyle cardigan & brown pleated skirt set",
    description: "Argyle cardigan & brown pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 280,
    sizes: ["S", "M", "L"],
    colors: ["Brown"],
    badge: "New",
    in_stock: true,
    sort_order: 139,
    image: "assets/products/argyle-cardigan-brown-pleated-skirt-set.jpg"
  },
  {
    id: "140",
    dept: "fashion",
    collection: "streetwear",
    name: "Red ruched sporty mini dress",
    description: "Red ruched sporty mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 195,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 140,
    image: "assets/products/red-ruched-sporty-mini-dress.jpg"
  },
  {
    id: "141",
    dept: "fashion",
    collection: "modest",
    name: "Pink strapless maxi dress",
    description: "Pink strapless maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 320,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 141,
    image: "assets/products/pink-strapless-maxi-dress.jpg"
  },
  {
    id: "142",
    dept: "fashion",
    collection: "streetwear",
    name: "Light-wash wide-leg jeans & tee set",
    description: "Light-wash wide-leg jeans & tee set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 185,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 142,
    image: "assets/products/light-wash-wide-leg-jeans-tee-set.jpg"
  },
  {
    id: "143",
    dept: "fashion",
    collection: "streetwear",
    name: "Beige angel tee & pleated skirt set",
    description: "Beige angel tee & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["Beige"],
    badge: "New",
    in_stock: true,
    sort_order: 143,
    image: "assets/products/beige-angel-tee-pleated-skirt-set.jpg"
  },
  {
    id: "144",
    dept: "fashion",
    collection: "streetwear",
    name: "Red bandeau & shorts set",
    description: "Red bandeau & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 245,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 144,
    image: "assets/products/red-bandeau-shorts-set.jpg"
  },
  {
    id: "145",
    dept: "fashion",
    collection: "streetwear",
    name: "Black-white raglan sweatshirt & blue skirt",
    description: "Black-white raglan sweatshirt & blue skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 325,
    sizes: ["S", "M", "L"],
    colors: ["Black-white", "White"],
    badge: "New",
    in_stock: true,
    sort_order: 145,
    image: "assets/products/black-white-raglan-sweatshirt-blue-skirt.jpg"
  },
  {
    id: "146",
    dept: "fashion",
    collection: "streetwear",
    name: "White top & black wide-leg trouser set",
    description: "White top & black wide-leg trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 365,
    sizes: ["S", "M", "L"],
    colors: ["White", "Black"],
    badge: "New",
    in_stock: true,
    sort_order: 146,
    image: "assets/products/white-top-black-wide-leg-trouser-set.jpg"
  },
  {
    id: "147",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink sweatshirt & trouser co-ord",
    description: "Pink sweatshirt & trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 205,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 147,
    image: "assets/products/pink-sweatshirt-trouser-co-ord.jpg"
  },
  {
    id: "148",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink bra-top & shorts set",
    description: "Pink bra-top & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 180,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 148,
    image: "assets/products/pink-bra-top-shorts-set.jpg"
  },
  {
    id: "149",
    dept: "fashion",
    collection: "streetwear",
    name: "Red Labella top, skirt & bag set",
    description: "Red Labella top, skirt & bag set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 335,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 149,
    image: "assets/products/red-labella-top-skirt-bag-set.jpg"
  },
  {
    id: "150",
    dept: "fashion",
    collection: "modest",
    name: "White bandeau & orange pleated maxi skirt",
    description: "White bandeau & orange pleated maxi skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["White", "Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 150,
    image: "assets/products/white-bandeau-orange-pleated-maxi-skirt.jpg"
  },
  {
    id: "151",
    dept: "fashion",
    collection: "streetwear",
    name: "Green New York sweatshirt & orange pleated skirt",
    description: "Green New York sweatshirt & orange pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 350,
    sizes: ["S", "M", "L"],
    colors: ["Green", "Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 151,
    image: "assets/products/green-new-york-sweatshirt-orange-pleated-skirt.jpg"
  },
  {
    id: "152",
    dept: "fashion",
    collection: "streetwear",
    name: "White feather-trim bodycon dress",
    description: "White feather-trim bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 210,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 152,
    image: "assets/products/white-feather-trim-bodycon-dress.jpg"
  },
  {
    id: "153",
    dept: "fashion",
    collection: "streetwear",
    name: "Light-blue denim shorts pair",
    description: "Light-blue denim shorts pair. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 265,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 153,
    image: "assets/products/light-blue-denim-shorts-pair.jpg"
  },
  {
    id: "154",
    dept: "fashion",
    collection: "streetwear",
    name: "Denim sleeveless jacket & shorts set",
    description: "Denim sleeveless jacket & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 180,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 154,
    image: "assets/products/denim-sleeveless-jacket-shorts-set.jpg"
  },
  {
    id: "155",
    dept: "fashion",
    collection: "streetwear",
    name: "Black cropped cardigan & denim skirt set",
    description: "Black cropped cardigan & denim skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 325,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 155,
    image: "assets/products/black-cropped-cardigan-denim-skirt-set.jpg"
  },
  {
    id: "156",
    dept: "fashion",
    collection: "streetwear",
    name: "Blue 89 sweatshirt & white pleated skirt",
    description: "Blue 89 sweatshirt & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 375,
    sizes: ["S", "M", "L"],
    colors: ["White", "Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 156,
    image: "assets/products/blue-89-sweatshirt-white-pleated-skirt.jpg"
  },
  {
    id: "157",
    dept: "fashion",
    collection: "streetwear",
    name: "Black Stanford top & check skirt set",
    description: "Black Stanford top & check skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 170,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 157,
    image: "assets/products/black-stanford-top-check-skirt-set.jpg"
  },
  {
    id: "158",
    dept: "fashion",
    collection: "modest",
    name: "Black lace top & black maxi skirt set",
    description: "Black lace top & black maxi skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 158,
    image: "assets/products/black-lace-top-black-maxi-skirt-set.jpg"
  },
  {
    id: "159",
    dept: "fashion",
    collection: "streetwear",
    name: "Green bow-print oversized tee",
    description: "Green bow-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 165,
    sizes: ["S", "M", "L"],
    colors: ["Green"],
    badge: "New",
    in_stock: true,
    sort_order: 159,
    image: "assets/products/green-bow-print-oversized-tee.jpg"
  },
  {
    id: "160",
    dept: "fashion",
    collection: "streetwear",
    name: "Black butterfly-print cargo trousers",
    description: "Black butterfly-print cargo trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.",
    price_ghs: 345,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 160,
    image: "assets/products/black-butterfly-print-cargo-trousers.jpg"
  },
  {
    id: "161",
    dept: "fashion",
    collection: "streetwear",
    name: "Black New York 16 tee & white pleated skirt",
    description: "Black New York 16 tee & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 215,
    sizes: ["S", "M", "L"],
    colors: ["White", "Black"],
    badge: "New",
    in_stock: true,
    sort_order: 161,
    image: "assets/products/black-new-york-16-tee-white-pleated-skirt.jpg"
  },
  {
    id: "162",
    dept: "fashion",
    collection: "streetwear",
    name: "Solid sleeveless dresses (purple / pink / lilac)",
    description: "Solid sleeveless dresses (purple / pink / lilac). An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 305,
    sizes: ["S", "M", "L"],
    colors: ["Pink", "Purple"],
    badge: "New",
    in_stock: true,
    sort_order: 162,
    image: "assets/products/solid-sleeveless-dresses-purple-pink-lilac.jpg"
  },
  {
    id: "163",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink hoodie & wide trouser co-ord",
    description: "Pink hoodie & wide trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 365,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 163,
    image: "assets/products/pink-hoodie-wide-trouser-co-ord.jpg"
  },
  {
    id: "164",
    dept: "fashion",
    collection: "streetwear",
    name: "Cut-out bodycon dress (black / mustard)",
    description: "Cut-out bodycon dress (black / mustard). An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 320,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Mustard"],
    badge: "New",
    in_stock: true,
    sort_order: 164,
    image: "assets/products/cut-out-bodycon-dress-black-mustard.jpg"
  },
  {
    id: "165",
    dept: "fashion",
    collection: "streetwear",
    name: "Red hoodie & distressed jeans set",
    description: "Red hoodie & distressed jeans set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 285,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 165,
    image: "assets/products/red-hoodie-distressed-jeans-set.jpg"
  },
  {
    id: "166",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink fringe-trim dress",
    description: "Pink fringe-trim dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 395,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 166,
    image: "assets/products/pink-fringe-trim-dress.jpg"
  },
  {
    id: "167",
    dept: "fashion",
    collection: "streetwear",
    name: "Black 23 tee & blue pleated skirt set",
    description: "Black 23 tee & blue pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 250,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 167,
    image: "assets/products/black-23-tee-blue-pleated-skirt-set.jpg"
  },
  {
    id: "168",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink draped bodycon dress",
    description: "Pink draped bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 295,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 168,
    image: "assets/products/pink-draped-bodycon-dress.jpg"
  },
  {
    id: "169",
    dept: "fashion",
    collection: "streetwear",
    name: "Yellow one-shoulder top, shorts & cap set",
    description: "Yellow one-shoulder top, shorts & cap set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 335,
    sizes: ["S", "M", "L"],
    colors: ["Yellow"],
    badge: "New",
    in_stock: true,
    sort_order: 169,
    image: "assets/products/yellow-one-shoulder-top-shorts-cap-set.jpg"
  },
  {
    id: "170",
    dept: "fashion",
    collection: "streetwear",
    name: "Deep-V pink mini dress",
    description: "Deep-V pink mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 295,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 170,
    image: "assets/products/deep-v-pink-mini-dress.jpg"
  },
  {
    id: "171",
    dept: "fashion",
    collection: "streetwear",
    name: "Lilac photo-print tee set with cap & bag",
    description: "Lilac photo-print tee set with cap & bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 265,
    sizes: ["S", "M", "L"],
    colors: ["Lilac"],
    badge: "New",
    in_stock: true,
    sort_order: 171,
    image: "assets/products/lilac-photo-print-tee-set-with-cap-bag.jpg"
  },
  {
    id: "172",
    dept: "fashion",
    collection: "streetwear",
    name: "Two-pack bandeau & shorts (black / pink)",
    description: "Two-pack bandeau & shorts (black / pink). A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 245,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 172,
    image: "assets/products/two-pack-bandeau-shorts-black-pink.jpg"
  },
  {
    id: "173",
    dept: "fashion",
    collection: "streetwear",
    name: "Black polo top & wide jeans set",
    description: "Black polo top & wide jeans set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 225,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 173,
    image: "assets/products/black-polo-top-wide-jeans-set.jpg"
  },
  {
    id: "174",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink 23 print cargo trousers",
    description: "Pink 23 print cargo trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.",
    price_ghs: 400,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 174,
    image: "assets/products/pink-23-print-cargo-trousers.jpg"
  },
  {
    id: "175",
    dept: "fashion",
    collection: "streetwear",
    name: "Spongebob white tee & denim skirt",
    description: "Spongebob white tee & denim skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 205,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 175,
    image: "assets/products/spongebob-white-tee-denim-skirt.jpg"
  },
  {
    id: "176",
    dept: "fashion",
    collection: "streetwear",
    name: "Black tee set with red cap & bag",
    description: "Black tee set with red cap & bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 370,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 176,
    image: "assets/products/black-tee-set-with-red-cap-bag.jpg"
  },
  {
    id: "177",
    dept: "fashion",
    collection: "streetwear",
    name: "Black tee set with pink cap & bag",
    description: "Black tee set with pink cap & bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 395,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 177,
    image: "assets/products/black-tee-set-with-pink-cap-bag.jpg"
  },
  {
    id: "178",
    dept: "fashion",
    collection: "streetwear",
    name: "Sage shirt-jacket & pleated skirt set",
    description: "Sage shirt-jacket & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 225,
    sizes: ["S", "M", "L"],
    colors: ["Sage"],
    badge: "New",
    in_stock: true,
    sort_order: 178,
    image: "assets/products/sage-shirt-jacket-pleated-skirt-set.jpg"
  },
  {
    id: "179",
    dept: "fashion",
    collection: "streetwear",
    name: "Orange top & white skirt set with bag",
    description: "Orange top & white skirt set with bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 175,
    sizes: ["S", "M", "L"],
    colors: ["White", "Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 179,
    image: "assets/products/orange-top-white-skirt-set-with-bag.jpg"
  },
  {
    id: "180",
    dept: "fashion",
    collection: "streetwear",
    name: "Grey hello kitty sweatshirt & white skirt",
    description: "Grey hello kitty sweatshirt & white skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["White", "Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 180,
    image: "assets/products/grey-hello-kitty-sweatshirt-white-skirt.jpg"
  },
  {
    id: "181",
    dept: "fashion",
    collection: "streetwear",
    name: "Girl-print white sweatshirt",
    description: "Girl-print white sweatshirt. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 245,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 181,
    image: "assets/products/girl-print-white-sweatshirt.jpg"
  },
  {
    id: "182",
    dept: "fashion",
    collection: "modest",
    name: "Blue fishnet halter maxi dress",
    description: "Blue fishnet halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 315,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 182,
    image: "assets/products/blue-fishnet-halter-maxi-dress.jpg"
  },
  {
    id: "183",
    dept: "fashion",
    collection: "streetwear",
    name: "White harlem 17 tee set with cap",
    description: "White harlem 17 tee set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 305,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 183,
    image: "assets/products/white-harlem-17-tee-set-with-cap.jpg"
  },
  {
    id: "184",
    dept: "fashion",
    collection: "streetwear",
    name: "Blue marble-print bodycon dress",
    description: "Blue marble-print bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 255,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 184,
    image: "assets/products/blue-marble-print-bodycon-dress.jpg"
  },
  {
    id: "185",
    dept: "fashion",
    collection: "streetwear",
    name: "Distressed wide-leg jeans",
    description: "Distressed wide-leg jeans. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.",
    price_ghs: 380,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 185,
    image: "assets/products/distressed-wide-leg-jeans.jpg"
  },
  {
    id: "186",
    dept: "fashion",
    collection: "streetwear",
    name: "White love-print trousers",
    description: "White love-print trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.",
    price_ghs: 290,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 186,
    image: "assets/products/white-love-print-trousers.jpg"
  },
  {
    id: "187",
    dept: "fashion",
    collection: "streetwear",
    name: "Contrast-trim tees (4 colours)",
    description: "Contrast-trim tees (4 colours). A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 240,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 187,
    image: "assets/products/contrast-trim-tees-4-colours.jpg"
  },
  {
    id: "188",
    dept: "fashion",
    collection: "streetwear",
    name: "Black & pink cargo trousers pair with bag",
    description: "Black & pink cargo trousers pair with bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 340,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 188,
    image: "assets/products/black-pink-cargo-trousers-pair-with-bag.jpg"
  },
  {
    id: "189",
    dept: "fashion",
    collection: "streetwear",
    name: "Green shirt & wide trouser co-ord",
    description: "Green shirt & wide trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 170,
    sizes: ["S", "M", "L"],
    colors: ["Green"],
    badge: "New",
    in_stock: true,
    sort_order: 189,
    image: "assets/products/green-shirt-wide-trouser-co-ord.jpg"
  },
  {
    id: "190",
    dept: "fashion",
    collection: "modest",
    name: "White cut-out maxi dress",
    description: "White cut-out maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 185,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 190,
    image: "assets/products/white-cut-out-maxi-dress.jpg"
  },
  {
    id: "191",
    dept: "fashion",
    collection: "streetwear",
    name: "Brown satin halter mini dress",
    description: "Brown satin halter mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 310,
    sizes: ["S", "M", "L"],
    colors: ["Brown"],
    badge: "New",
    in_stock: true,
    sort_order: 191,
    image: "assets/products/brown-satin-halter-mini-dress.jpg"
  },
  {
    id: "192",
    dept: "fashion",
    collection: "modest",
    name: "Pink halter maxi dress",
    description: "Pink halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 280,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 192,
    image: "assets/products/pink-halter-maxi-dress.jpg"
  },
  {
    id: "193",
    dept: "fashion",
    collection: "streetwear",
    name: "Beige photo-print tee (shop rail shot)",
    description: "Beige photo-print tee (shop rail shot). A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 200,
    sizes: ["S", "M", "L"],
    colors: ["Beige"],
    badge: "New",
    in_stock: true,
    sort_order: 193,
    image: "assets/products/beige-photo-print-tee-shop-rail-shot.jpg"
  },
  {
    id: "194",
    dept: "fashion",
    collection: "streetwear",
    name: "Black tee & check skirt set",
    description: "Black tee & check skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 390,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 194,
    image: "assets/products/black-tee-check-skirt-set.jpg"
  },
  {
    id: "195",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink smurf hoodie & white pleated skirt",
    description: "Pink smurf hoodie & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 255,
    sizes: ["S", "M", "L"],
    colors: ["White", "Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 195,
    image: "assets/products/pink-smurf-hoodie-white-pleated-skirt.jpg"
  },
  {
    id: "196",
    dept: "fashion",
    collection: "streetwear",
    name: "Green sweatshirt & white mini skirt",
    description: "Green sweatshirt & white mini skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 195,
    sizes: ["S", "M", "L"],
    colors: ["White", "Green"],
    badge: "New",
    in_stock: true,
    sort_order: 196,
    image: "assets/products/green-sweatshirt-white-mini-skirt.jpg"
  },
  {
    id: "197",
    dept: "fashion",
    collection: "streetwear",
    name: "Red spaghetti-strap bodycon dress",
    description: "Red spaghetti-strap bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 305,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 197,
    image: "assets/products/red-spaghetti-strap-bodycon-dress.jpg"
  },
  {
    id: "198",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink butterfly-print oversized tee",
    description: "Pink butterfly-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 280,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 198,
    image: "assets/products/pink-butterfly-print-oversized-tee.jpg"
  },
  {
    id: "199",
    dept: "fashion",
    collection: "streetwear",
    name: "Distressed denim mini skirt",
    description: "Distressed denim mini skirt. A wardrobe-mixing skirt from the September market drop, photographed exactly as it arrives.",
    price_ghs: 160,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 199,
    image: "assets/products/distressed-denim-mini-skirt.jpg"
  },
  {
    id: "200",
    dept: "fashion",
    collection: "streetwear",
    name: "Black-white leaf-print shirt & shorts set",
    description: "Black-white leaf-print shirt & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 360,
    sizes: ["S", "M", "L"],
    colors: ["Black-white", "White"],
    badge: "New",
    in_stock: true,
    sort_order: 200,
    image: "assets/products/black-white-leaf-print-shirt-shorts-set.jpg"
  },
  {
    id: "201",
    dept: "fashion",
    collection: "streetwear",
    name: "Light-blue shirt & wide trouser co-ord",
    description: "Light-blue shirt & wide trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 170,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 201,
    image: "assets/products/light-blue-shirt-wide-trouser-co-ord.jpg"
  },
  {
    id: "202",
    dept: "fashion",
    collection: "streetwear",
    name: "Olive photo-print tee set with bag & cap",
    description: "Olive photo-print tee set with bag & cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 390,
    sizes: ["S", "M", "L"],
    colors: ["Olive"],
    badge: "New",
    in_stock: true,
    sort_order: 202,
    image: "assets/products/olive-photo-print-tee-set-with-bag-cap.jpg"
  },
  {
    id: "203",
    dept: "fashion",
    collection: "streetwear",
    name: "Strawberry sweatshirt & red pleated skirt",
    description: "Strawberry sweatshirt & red pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 325,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 203,
    image: "assets/products/strawberry-sweatshirt-red-pleated-skirt.jpg"
  },
  {
    id: "204",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink shrug, top & denim shorts set",
    description: "Pink shrug, top & denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 204,
    image: "assets/products/pink-shrug-top-denim-shorts-set.jpg"
  },
  {
    id: "205",
    dept: "fashion",
    collection: "streetwear",
    name: "Cow-print bra-top & skirt set",
    description: "Cow-print bra-top & skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 400,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 205,
    image: "assets/products/cow-print-bra-top-skirt-set.jpg"
  },
  {
    id: "206",
    dept: "fashion",
    collection: "streetwear",
    name: "Grey cargo skirt & white tee set",
    description: "Grey cargo skirt & white tee set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 250,
    sizes: ["S", "M", "L"],
    colors: ["White", "Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 206,
    image: "assets/products/grey-cargo-skirt-white-tee-set.jpg"
  },
  {
    id: "207",
    dept: "fashion",
    collection: "streetwear",
    name: "Red stripe tee & shorts set",
    description: "Red stripe tee & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 255,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 207,
    image: "assets/products/red-stripe-tee-shorts-set.jpg"
  },
  {
    id: "208",
    dept: "fashion",
    collection: "modest",
    name: "White textured halter maxi dress",
    description: "White textured halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 370,
    sizes: ["S", "M", "L"],
    colors: ["White", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 208,
    image: "assets/products/white-textured-halter-maxi-dress.jpg"
  },
  {
    id: "209",
    dept: "fashion",
    collection: "modest",
    name: "Wine-red gradient cross-back maxi dress",
    description: "Wine-red gradient cross-back maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 260,
    sizes: ["S", "M", "L"],
    colors: ["Red", "Wine"],
    badge: "New",
    in_stock: true,
    sort_order: 209,
    image: "assets/products/wine-red-gradient-cross-back-maxi-dress.jpg"
  },
  {
    id: "210",
    dept: "fashion",
    collection: "modest",
    name: "Red strapless maxi dress",
    description: "Red strapless maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 340,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 210,
    image: "assets/products/red-strapless-maxi-dress.jpg"
  },
  {
    id: "211",
    dept: "fashion",
    collection: "streetwear",
    name: "Brown Milk raglan sweatshirt & skirt set",
    description: "Brown Milk raglan sweatshirt & skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 305,
    sizes: ["S", "M", "L"],
    colors: ["Brown"],
    badge: "New",
    in_stock: true,
    sort_order: 211,
    image: "assets/products/brown-milk-raglan-sweatshirt-skirt-set.jpg"
  },
  {
    id: "212",
    dept: "fashion",
    collection: "streetwear",
    name: "Check trouser, top & cap set",
    description: "Check trouser, top & cap set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 335,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 212,
    image: "assets/products/check-trouser-top-cap-set.jpg"
  },
  {
    id: "213",
    dept: "fashion",
    collection: "streetwear",
    name: "Black Betty Boop tee set with cap",
    description: "Black Betty Boop tee set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 295,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 213,
    image: "assets/products/black-betty-boop-tee-set-with-cap.jpg"
  },
  {
    id: "214",
    dept: "fashion",
    collection: "modest",
    name: "Blue denim strapless maxi dress",
    description: "Blue denim strapless maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 170,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 214,
    image: "assets/products/blue-denim-strapless-maxi-dress.jpg"
  },
  {
    id: "215",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink top & distressed jeans set with cap",
    description: "Pink top & distressed jeans set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 175,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 215,
    image: "assets/products/pink-top-distressed-jeans-set-with-cap.jpg"
  },
  {
    id: "216",
    dept: "fashion",
    collection: "modest",
    name: "Pink strapless maxi dress",
    description: "Pink strapless maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 235,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 216,
    image: "assets/products/pink-strapless-maxi-dress.jpg"
  },
  {
    id: "217",
    dept: "fashion",
    collection: "modest",
    name: "White textured halter maxi jumpsuit",
    description: "White textured halter maxi jumpsuit. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 300,
    sizes: ["S", "M", "L"],
    colors: ["White", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 217,
    image: "assets/products/white-textured-halter-maxi-jumpsuit.jpg"
  },
  {
    id: "218",
    dept: "fashion",
    collection: "streetwear",
    name: "Green Brooklyn sweatshirt & white pleated skirt",
    description: "Green Brooklyn sweatshirt & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 370,
    sizes: ["S", "M", "L"],
    colors: ["White", "Green"],
    badge: "New",
    in_stock: true,
    sort_order: 218,
    image: "assets/products/green-brooklyn-sweatshirt-white-pleated-skirt.jpg"
  },
  {
    id: "219",
    dept: "fashion",
    collection: "streetwear",
    name: "White 90 jersey & grey skirt set with cap",
    description: "White 90 jersey & grey skirt set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 360,
    sizes: ["S", "M", "L"],
    colors: ["White", "Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 219,
    image: "assets/products/white-90-jersey-grey-skirt-set-with-cap.jpg"
  },
  {
    id: "220",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink bra-top, shorts & cap set",
    description: "Pink bra-top, shorts & cap set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 170,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 220,
    image: "assets/products/pink-bra-top-shorts-cap-set.jpg"
  },
  {
    id: "221",
    dept: "fashion",
    collection: "streetwear",
    name: "Orange corset top & denim shorts set",
    description: "Orange corset top & denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 165,
    sizes: ["S", "M", "L"],
    colors: ["Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 221,
    image: "assets/products/orange-corset-top-denim-shorts-set.jpg"
  },
  {
    id: "222",
    dept: "fashion",
    collection: "modest",
    name: "Orange shrug, top & green pleated maxi skirt",
    description: "Orange shrug, top & green pleated maxi skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 380,
    sizes: ["S", "M", "L"],
    colors: ["Green", "Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 222,
    image: "assets/products/orange-shrug-top-green-pleated-maxi-skirt.jpg"
  },
  {
    id: "223",
    dept: "fashion",
    collection: "streetwear",
    name: "Grey bandeau & shorts set",
    description: "Grey bandeau & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 370,
    sizes: ["S", "M", "L"],
    colors: ["Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 223,
    image: "assets/products/grey-bandeau-shorts-set.jpg"
  },
  {
    id: "224",
    dept: "fashion",
    collection: "streetwear",
    name: "Black-white stripe shirt & shorts set",
    description: "Black-white stripe shirt & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 245,
    sizes: ["S", "M", "L"],
    colors: ["Black-white", "White"],
    badge: "New",
    in_stock: true,
    sort_order: 224,
    image: "assets/products/black-white-stripe-shirt-shorts-set.jpg"
  },
  {
    id: "225",
    dept: "fashion",
    collection: "streetwear",
    name: "Red top & white wide-leg trousers (model shot)",
    description: "Red top & white wide-leg trousers (model shot). A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 355,
    sizes: ["S", "M", "L"],
    colors: ["White", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 225,
    image: "assets/products/red-top-white-wide-leg-trousers-model-shot.jpg"
  },
  {
    id: "226",
    dept: "fashion",
    collection: "streetwear",
    name: "Cherry sweatshirt & red check skirt",
    description: "Cherry sweatshirt & red check skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 226,
    image: "assets/products/cherry-sweatshirt-red-check-skirt.jpg"
  },
  {
    id: "227",
    dept: "fashion",
    collection: "streetwear",
    name: "White polo dress with cap",
    description: "White polo dress with cap. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 365,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 227,
    image: "assets/products/white-polo-dress-with-cap.jpg"
  },
  {
    id: "228",
    dept: "fashion",
    collection: "modest",
    name: "Light-blue lace shrug & maxi skirt set",
    description: "Light-blue lace shrug & maxi skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 290,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 228,
    image: "assets/products/light-blue-lace-shrug-maxi-skirt-set.jpg"
  },
  {
    id: "229",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink hoodie & pleated skirt set with chain",
    description: "Pink hoodie & pleated skirt set with chain. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 240,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 229,
    image: "assets/products/pink-hoodie-pleated-skirt-set-with-chain.jpg"
  },
  {
    id: "230",
    dept: "fashion",
    collection: "streetwear",
    name: "Black butterfly-embroidered wide trousers",
    description: "Black butterfly-embroidered wide trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.",
    price_ghs: 375,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 230,
    image: "assets/products/black-butterfly-embroidered-wide-trousers.jpg"
  },
  {
    id: "231",
    dept: "fashion",
    collection: "streetwear",
    name: "White textured strapless dress",
    description: "White textured strapless dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 270,
    sizes: ["S", "M", "L"],
    colors: ["White", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 231,
    image: "assets/products/white-textured-strapless-dress.jpg"
  },
  {
    id: "232",
    dept: "fashion",
    collection: "streetwear",
    name: "White Labella top, skirt & bag set",
    description: "White Labella top, skirt & bag set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 360,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 232,
    image: "assets/products/white-labella-top-skirt-bag-set.jpg"
  },
  {
    id: "233",
    dept: "fashion",
    collection: "streetwear",
    name: "Lilac bow halter dress",
    description: "Lilac bow halter dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 260,
    sizes: ["S", "M", "L"],
    colors: ["Lilac"],
    badge: "New",
    in_stock: true,
    sort_order: 233,
    image: "assets/products/lilac-bow-halter-dress.jpg"
  },
  {
    id: "234",
    dept: "fashion",
    collection: "streetwear",
    name: "Black halter top & shorts set with cap",
    description: "Black halter top & shorts set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 155,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 234,
    image: "assets/products/black-halter-top-shorts-set-with-cap.jpg"
  },
  {
    id: "235",
    dept: "fashion",
    collection: "streetwear",
    name: "Blue denim jacket & skirt set",
    description: "Blue denim jacket & skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 295,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 235,
    image: "assets/products/blue-denim-jacket-skirt-set.jpg"
  },
  {
    id: "236",
    dept: "fashion",
    collection: "modest",
    name: "Black halter maxi dress",
    description: "Black halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 260,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 236,
    image: "assets/products/black-halter-maxi-dress.jpg"
  },
  {
    id: "237",
    dept: "fashion",
    collection: "streetwear",
    name: "Light-blue wide-leg cargo jeans & top set",
    description: "Light-blue wide-leg cargo jeans & top set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 200,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 237,
    image: "assets/products/light-blue-wide-leg-cargo-jeans-top-set.jpg"
  },
  {
    id: "238",
    dept: "fashion",
    collection: "streetwear",
    name: "Red M sweatshirt & black pleated skirt",
    description: "Red M sweatshirt & black pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 345,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 238,
    image: "assets/products/red-m-sweatshirt-black-pleated-skirt.jpg"
  },
  {
    id: "239",
    dept: "fashion",
    collection: "streetwear",
    name: "Orange Houston tee & white pleated skirt set",
    description: "Orange Houston tee & white pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 185,
    sizes: ["S", "M", "L"],
    colors: ["White", "Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 239,
    image: "assets/products/orange-houston-tee-white-pleated-skirt-set.jpg"
  },
  {
    id: "240",
    dept: "fashion",
    collection: "modest",
    name: "Orange fishnet halter maxi dress",
    description: "Orange fishnet halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 305,
    sizes: ["S", "M", "L"],
    colors: ["Orange"],
    badge: "New",
    in_stock: true,
    sort_order: 240,
    image: "assets/products/orange-fishnet-halter-maxi-dress.jpg"
  },
  {
    id: "241",
    dept: "fashion",
    collection: "streetwear",
    name: "White one-shoulder top & shorts set",
    description: "White one-shoulder top & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 165,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 241,
    image: "assets/products/white-one-shoulder-top-shorts-set.jpg"
  },
  {
    id: "242",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink Calvin tee & shorts set",
    description: "Pink Calvin tee & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 215,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 242,
    image: "assets/products/pink-calvin-tee-shorts-set.jpg"
  },
  {
    id: "243",
    dept: "fashion",
    collection: "streetwear",
    name: "Blue alo shirt & pleated skirt set with bag",
    description: "Blue alo shirt & pleated skirt set with bag. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 395,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 243,
    image: "assets/products/blue-alo-shirt-pleated-skirt-set-with-bag.jpg"
  },
  {
    id: "244",
    dept: "fashion",
    collection: "streetwear",
    name: "White cargo trousers pair",
    description: "White cargo trousers pair. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.",
    price_ghs: 240,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 244,
    image: "assets/products/white-cargo-trousers-pair.jpg"
  },
  {
    id: "245",
    dept: "fashion",
    collection: "streetwear",
    name: "Black angel top & red check skirt",
    description: "Black angel top & red check skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 190,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 245,
    image: "assets/products/black-angel-top-red-check-skirt.jpg"
  },
  {
    id: "246",
    dept: "fashion",
    collection: "streetwear",
    name: "Yellow pleated mini dress",
    description: "Yellow pleated mini dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 385,
    sizes: ["S", "M", "L"],
    colors: ["Yellow"],
    badge: "New",
    in_stock: true,
    sort_order: 246,
    image: "assets/products/yellow-pleated-mini-dress.jpg"
  },
  {
    id: "247",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink hoodie & pleated skirt set",
    description: "Pink hoodie & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 225,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 247,
    image: "assets/products/pink-hoodie-pleated-skirt-set.jpg"
  },
  {
    id: "248",
    dept: "fashion",
    collection: "streetwear",
    name: "Wine draped bodycon dress",
    description: "Wine draped bodycon dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 275,
    sizes: ["S", "M", "L"],
    colors: ["Wine"],
    badge: "New",
    in_stock: true,
    sort_order: 248,
    image: "assets/products/wine-draped-bodycon-dress.jpg"
  },
  {
    id: "249",
    dept: "fashion",
    collection: "modest",
    name: "Brown fishnet halter maxi dress",
    description: "Brown fishnet halter maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 275,
    sizes: ["S", "M", "L"],
    colors: ["Brown"],
    badge: "New",
    in_stock: true,
    sort_order: 249,
    image: "assets/products/brown-fishnet-halter-maxi-dress.jpg"
  },
  {
    id: "251",
    dept: "fashion",
    collection: "modest",
    name: "Black abaya-style dress & hijab set",
    description: "Black abaya-style dress & hijab set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 305,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 251,
    image: "assets/products/black-abaya-style-dress-hijab-set.jpg"
  },
  {
    id: "252",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink top & light denim shorts set",
    description: "Pink top & light denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 175,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 252,
    image: "assets/products/pink-top-light-denim-shorts-set.jpg"
  },
  {
    id: "253",
    dept: "fashion",
    collection: "streetwear",
    name: "Beige cartoon-print oversized tee",
    description: "Beige cartoon-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 200,
    sizes: ["S", "M", "L"],
    colors: ["Beige"],
    badge: "New",
    in_stock: true,
    sort_order: 253,
    image: "assets/products/beige-cartoon-print-oversized-tee.jpg"
  },
  {
    id: "254",
    dept: "fashion",
    collection: "streetwear",
    name: "Pleated mini skirts (black & camel)",
    description: "Pleated mini skirts (black & camel). A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 290,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Camel"],
    badge: "New",
    in_stock: true,
    sort_order: 254,
    image: "assets/products/pleated-mini-skirts-black-camel.jpg"
  },
  {
    id: "255",
    dept: "fashion",
    collection: "streetwear",
    name: "White photo-print tee & grey cargo trouser set",
    description: "White photo-print tee & grey cargo trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 275,
    sizes: ["S", "M", "L"],
    colors: ["White", "Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 255,
    image: "assets/products/white-photo-print-tee-grey-cargo-trouser-set.jpg"
  },
  {
    id: "256",
    dept: "fashion",
    collection: "streetwear",
    name: "Sage photo-print oversized sweatshirt",
    description: "Sage photo-print oversized sweatshirt. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 325,
    sizes: ["S", "M", "L"],
    colors: ["Sage"],
    badge: "New",
    in_stock: true,
    sort_order: 256,
    image: "assets/products/sage-photo-print-oversized-sweatshirt.jpg"
  },
  {
    id: "257",
    dept: "fashion",
    collection: "streetwear",
    name: "Red jacket, trouser & bag tracksuit set",
    description: "Red jacket, trouser & bag tracksuit set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 235,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 257,
    image: "assets/products/red-jacket-trouser-bag-tracksuit-set.jpg"
  },
  {
    id: "258",
    dept: "fashion",
    collection: "streetwear",
    name: "Tweety cream oversized tee",
    description: "Tweety cream oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 190,
    sizes: ["S", "M", "L"],
    colors: ["Cream"],
    badge: "New",
    in_stock: true,
    sort_order: 258,
    image: "assets/products/tweety-cream-oversized-tee.jpg"
  },
  {
    id: "259",
    dept: "fashion",
    collection: "streetwear",
    name: "Red tee & shorts co-ord",
    description: "Red tee & shorts co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 285,
    sizes: ["S", "M", "L"],
    colors: ["Red"],
    badge: "New",
    in_stock: true,
    sort_order: 259,
    image: "assets/products/red-tee-shorts-co-ord.jpg"
  },
  {
    id: "260",
    dept: "fashion",
    collection: "streetwear",
    name: "Black 86 tee & white pleated skirt",
    description: "Black 86 tee & white pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 325,
    sizes: ["S", "M", "L"],
    colors: ["White", "Black"],
    badge: "New",
    in_stock: true,
    sort_order: 260,
    image: "assets/products/black-86-tee-white-pleated-skirt.jpg"
  },
  {
    id: "261",
    dept: "fashion",
    collection: "streetwear",
    name: "Cream serpico sweatshirt & brown pleated skirt",
    description: "Cream serpico sweatshirt & brown pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 235,
    sizes: ["S", "M", "L"],
    colors: ["Brown", "Cream"],
    badge: "New",
    in_stock: true,
    sort_order: 261,
    image: "assets/products/cream-serpico-sweatshirt-brown-pleated-skirt.jpg"
  },
  {
    id: "262",
    dept: "fashion",
    collection: "streetwear",
    name: "Blue hooded cape & pleated skirt set",
    description: "Blue hooded cape & pleated skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 375,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 262,
    image: "assets/products/blue-hooded-cape-pleated-skirt-set.jpg"
  },
  {
    id: "263",
    dept: "fashion",
    collection: "streetwear",
    name: "Green 8E sweatshirt & yellow pleated skirt",
    description: "Green 8E sweatshirt & yellow pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 280,
    sizes: ["S", "M", "L"],
    colors: ["Green", "Yellow"],
    badge: "New",
    in_stock: true,
    sort_order: 263,
    image: "assets/products/green-8e-sweatshirt-yellow-pleated-skirt.jpg"
  },
  {
    id: "264",
    dept: "fashion",
    collection: "streetwear",
    name: "Hello Kitty pink tee",
    description: "Hello Kitty pink tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 260,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 264,
    image: "assets/products/hello-kitty-pink-tee.jpg"
  },
  {
    id: "265",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink bear hoodie & camel pleated skirt",
    description: "Pink bear hoodie & camel pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 365,
    sizes: ["S", "M", "L"],
    colors: ["Pink", "Camel"],
    badge: "New",
    in_stock: true,
    sort_order: 265,
    image: "assets/products/pink-bear-hoodie-camel-pleated-skirt.jpg"
  },
  {
    id: "266",
    dept: "fashion",
    collection: "streetwear",
    name: "Powerpuff Girls pink tee",
    description: "Powerpuff Girls pink tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 270,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 266,
    image: "assets/products/powerpuff-girls-pink-tee.jpg"
  },
  {
    id: "267",
    dept: "fashion",
    collection: "streetwear",
    name: "Yellow peto hoodie & red pleated skirt",
    description: "Yellow peto hoodie & red pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 220,
    sizes: ["S", "M", "L"],
    colors: ["Red", "Yellow"],
    badge: "New",
    in_stock: true,
    sort_order: 267,
    image: "assets/products/yellow-peto-hoodie-red-pleated-skirt.jpg"
  },
  {
    id: "268",
    dept: "fashion",
    collection: "streetwear",
    name: "White contrast polo & denim shorts set",
    description: "White contrast polo & denim shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 195,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 268,
    image: "assets/products/white-contrast-polo-denim-shorts-set.jpg"
  },
  {
    id: "269",
    dept: "fashion",
    collection: "streetwear",
    name: "White alo tee & pink wide trouser set",
    description: "White alo tee & pink wide trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 175,
    sizes: ["S", "M", "L"],
    colors: ["White", "Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 269,
    image: "assets/products/white-alo-tee-pink-wide-trouser-set.jpg"
  },
  {
    id: "270",
    dept: "fashion",
    collection: "streetwear",
    name: "White china sweatshirt & grey pleated skirt",
    description: "White china sweatshirt & grey pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 205,
    sizes: ["S", "M", "L"],
    colors: ["White", "Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 270,
    image: "assets/products/white-china-sweatshirt-grey-pleated-skirt.jpg"
  },
  {
    id: "271",
    dept: "fashion",
    collection: "streetwear",
    name: "Comptons sweatshirt & check skirt set",
    description: "Comptons sweatshirt & check skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 195,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 271,
    image: "assets/products/comptons-sweatshirt-check-skirt-set.jpg"
  },
  {
    id: "272",
    dept: "fashion",
    collection: "streetwear",
    name: "Black California sweatshirt & check skirt",
    description: "Black California sweatshirt & check skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 220,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 272,
    image: "assets/products/black-california-sweatshirt-check-skirt.jpg"
  },
  {
    id: "273",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink hoodie, shorts & sneakers set",
    description: "Pink hoodie, shorts & sneakers set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 360,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 273,
    image: "assets/products/pink-hoodie-shorts-sneakers-set.jpg"
  },
  {
    id: "274",
    dept: "fashion",
    collection: "streetwear",
    name: "Olive zip jacket & wide trouser set",
    description: "Olive zip jacket & wide trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 220,
    sizes: ["S", "M", "L"],
    colors: ["Olive"],
    badge: "New",
    in_stock: true,
    sort_order: 274,
    image: "assets/products/olive-zip-jacket-wide-trouser-set.jpg"
  },
  {
    id: "275",
    dept: "fashion",
    collection: "modest",
    name: "Olive gradient maxi dress",
    description: "Olive gradient maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 150,
    sizes: ["S", "M", "L"],
    colors: ["Olive"],
    badge: "New",
    in_stock: true,
    sort_order: 275,
    image: "assets/products/olive-gradient-maxi-dress.jpg"
  },
  {
    id: "276",
    dept: "fashion",
    collection: "streetwear",
    name: "Stitch lilac tee set with cap",
    description: "Stitch lilac tee set with cap. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 305,
    sizes: ["S", "M", "L"],
    colors: ["Lilac"],
    badge: "New",
    in_stock: true,
    sort_order: 276,
    image: "assets/products/stitch-lilac-tee-set-with-cap.jpg"
  },
  {
    id: "277",
    dept: "fashion",
    collection: "streetwear",
    name: "Black hoodie & trouser tracksuit set",
    description: "Black hoodie & trouser tracksuit set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 335,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    badge: "New",
    in_stock: true,
    sort_order: 277,
    image: "assets/products/black-hoodie-trouser-tracksuit-set.jpg"
  },
  {
    id: "278",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink baby-girl top & denim cargo shorts set",
    description: "Pink baby-girl top & denim cargo shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 205,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 278,
    image: "assets/products/pink-baby-girl-top-denim-cargo-shorts-set.jpg"
  },
  {
    id: "279",
    dept: "fashion",
    collection: "streetwear",
    name: "Lilac shirt-dress with bag",
    description: "Lilac shirt-dress with bag. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 230,
    sizes: ["S", "M", "L"],
    colors: ["Lilac"],
    badge: "New",
    in_stock: true,
    sort_order: 279,
    image: "assets/products/lilac-shirt-dress-with-bag.jpg"
  },
  {
    id: "280",
    dept: "fashion",
    collection: "streetwear",
    name: "Leopard & solid pleated skirt pack",
    description: "Leopard & solid pleated skirt pack. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 240,
    sizes: ["S", "M", "L"],
    colors: ["Multi"],
    badge: "New",
    in_stock: true,
    sort_order: 280,
    image: "assets/products/leopard-solid-pleated-skirt-pack.jpg"
  },
  {
    id: "281",
    dept: "fashion",
    collection: "streetwear",
    name: "Grey hoodie & wide trouser co-ord",
    description: "Grey hoodie & wide trouser co-ord. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 150,
    sizes: ["S", "M", "L"],
    colors: ["Grey"],
    badge: "New",
    in_stock: true,
    sort_order: 281,
    image: "assets/products/grey-hoodie-wide-trouser-co-ord.jpg"
  },
  {
    id: "282",
    dept: "fashion",
    collection: "streetwear",
    name: "White heart-print sweatshirt",
    description: "White heart-print sweatshirt. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 195,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 282,
    image: "assets/products/white-heart-print-sweatshirt.jpg"
  },
  {
    id: "283",
    dept: "fashion",
    collection: "streetwear",
    name: "Purple nike two-piece & sneaker set",
    description: "Purple nike two-piece & sneaker set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 280,
    sizes: ["S", "M", "L"],
    colors: ["Purple"],
    badge: "New",
    in_stock: true,
    sort_order: 283,
    image: "assets/products/purple-nike-two-piece-sneaker-set.jpg"
  },
  {
    id: "284",
    dept: "fashion",
    collection: "streetwear",
    name: "Blue polo shirt & skirt set",
    description: "Blue polo shirt & skirt set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 320,
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    badge: "New",
    in_stock: true,
    sort_order: 284,
    image: "assets/products/blue-polo-shirt-skirt-set.jpg"
  },
  {
    id: "285",
    dept: "fashion",
    collection: "streetwear",
    name: "Wine velour hoodie & trouser set",
    description: "Wine velour hoodie & trouser set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 265,
    sizes: ["S", "M", "L"],
    colors: ["Wine"],
    badge: "New",
    in_stock: true,
    sort_order: 285,
    image: "assets/products/wine-velour-hoodie-trouser-set.jpg"
  },
  {
    id: "286",
    dept: "fashion",
    collection: "streetwear",
    name: "White floral shirt & shorts set",
    description: "White floral shirt & shorts set. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 345,
    sizes: ["S", "M", "L"],
    colors: ["White"],
    badge: "New",
    in_stock: true,
    sort_order: 286,
    image: "assets/products/white-floral-shirt-shorts-set.jpg"
  },
  {
    id: "287",
    dept: "fashion",
    collection: "streetwear",
    name: "White bulls top & red pleated skirt",
    description: "White bulls top & red pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 330,
    sizes: ["S", "M", "L"],
    colors: ["White", "Red"],
    badge: "New",
    in_stock: true,
    sort_order: 287,
    image: "assets/products/white-bulls-top-red-pleated-skirt.jpg"
  },
  {
    id: "288",
    dept: "fashion",
    collection: "streetwear",
    name: "Black sweatshirt & yellow pleated skirt",
    description: "Black sweatshirt & yellow pleated skirt. A matched co-ord from the September market drop - style the pieces together or mix them across your rail.",
    price_ghs: 250,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Yellow"],
    badge: "New",
    in_stock: true,
    sort_order: 288,
    image: "assets/products/black-sweatshirt-yellow-pleated-skirt.jpg"
  },
  {
    id: "289",
    dept: "fashion",
    collection: "modest",
    name: "Green ruched maxi dress",
    description: "Green ruched maxi dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 190,
    sizes: ["S", "M", "L"],
    colors: ["Green"],
    badge: "New",
    in_stock: true,
    sort_order: 289,
    image: "assets/products/green-ruched-maxi-dress.jpg"
  },
  {
    id: "290",
    dept: "fashion",
    collection: "streetwear",
    name: "Green Q heart-print oversized tee",
    description: "Green Q heart-print oversized tee. A quick-styling layer from the September market drop, photographed exactly as it arrives.",
    price_ghs: 370,
    sizes: ["S", "M", "L"],
    colors: ["Green"],
    badge: "New",
    in_stock: true,
    sort_order: 290,
    image: "assets/products/green-q-heart-print-oversized-tee.jpg"
  },
  {
    id: "291",
    dept: "fashion",
    collection: "streetwear",
    name: "Yellow ruffle tiered dress",
    description: "Yellow ruffle tiered dress. An easy pull-on piece from the September market drop, photographed exactly as it arrives.",
    price_ghs: 310,
    sizes: ["S", "M", "L"],
    colors: ["Red", "Yellow"],
    badge: "New",
    in_stock: true,
    sort_order: 291,
    image: "assets/products/yellow-ruffle-tiered-dress.jpg"
  },
  {
    id: "292",
    dept: "fashion",
    collection: "streetwear",
    name: "Pink butterfly cargo trousers",
    description: "Pink butterfly cargo trousers. Market-drop trousers, photographed exactly as they arrive - easy to dress up or down.",
    price_ghs: 345,
    sizes: ["S", "M", "L"],
    colors: ["Pink"],
    badge: "New",
    in_stock: true,
    sort_order: 292,
    image: "assets/products/pink-butterfly-cargo-trousers.jpg"
  }
];

let productsCache = null;
const PRODUCTS_KEY = "velloura_products_v4";

function readStore() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.map(normalizeProduct).filter(isClothing) : null;
  } catch (err) {
    return null;
  }
}

function writeStore(products) {
  const list = (products || []).map(normalizeProduct).filter(isClothing);
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  } catch (err) {
    if (err && (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014)) {
      throw new Error("Browser storage is full. Remove a photo, or connect Supabase so photos are hosted instead.");
    }
    throw err;
  }
  productsCache = list.map(cloneProduct);
}

function isClothing(product) {
  if (product.dept && product.dept !== "fashion") return false;
  if (product.collection === "thrift") return false;
  return true;
}

function normalizeProduct(row) {
  const sizes = Array.isArray(row.sizes) ? row.sizes : [];
  const colors = Array.isArray(row.colors) ? row.colors : [];
  const id = stringId(row.id);
  // blob: URLs are edit-session previews only — never persist them.
  const images = (Array.isArray(row.images) ? row.images : [])
    .map((src) => String(src || "").trim())
    .filter((src) => src && !src.startsWith("blob:"));
  const coverImage = String(row.image || "").trim();
  const cover = (coverImage.startsWith("blob:") ? "" : coverImage) || images[0] || null;
  const allImages = cover
    ? [cover, ...images.filter((src) => src !== cover)]
    : images;
  const was = row.compare_at_ghs;
  return {
    id,
    dept: row.dept,
    collection: row.collection || null,
    name: row.name,
    description: row.description || "",
    price_ghs: Number(row.price_ghs),
    compare_at_ghs: was == null || was === "" ? null : Number(was),
    flash_sale: row.flash_sale === true,
    sizes,
    colors,
    badge: row.badge || null,
    in_stock: row.in_stock !== false,
    sort_order: Number(row.sort_order || 0),
    image: cover,
    images: allImages,
    slug: slugifyName(row.name)
  };
}

function slugifyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cloneProduct(p) {
  return {
    ...p,
    sizes: [...(p.sizes || [])],
    colors: [...(p.colors || [])],
    images: [...(p.images || [])]
  };
}

export function getLocalProducts() {
  return LOCAL_PRODUCTS.map(normalizeProduct);
}

async function loadBaseProducts() {
  if (isDemoMode) return getLocalProducts();
  const ready = await waitForSupabase();
  if (!ready) throw new Error("Supabase JS library is not loaded.");
  const sb = getSupabaseClient();
  if (!sb) throw new Error("Supabase is not connected.");
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeProduct).filter(isClothing);
}

export async function loadProducts({ force = false } = {}) {
  if (!force && productsCache) return productsCache.map(cloneProduct);

  if (!isDemoMode) {
    try {
      const remote = await loadBaseProducts();
      if (remote.length) {
        writeStore(remote);
        return remote.map(cloneProduct);
      }
    } catch (err) {
      console.error(err);
    }
    const stored = readStore();
    if (stored && stored.length) return stored.map(cloneProduct);
    const local = getLocalProducts();
    writeStore(local);
    return local.map(cloneProduct);
  }

  if (!force) {
    const stored = readStore();
    if (stored) return stored.map(cloneProduct);
  }
  const base = await loadBaseProducts();
  writeStore(base);
  return base.map(cloneProduct);
}

// Save a product. Always updates the browser store first so Seller Center
// reacts instantly, then syncs to Supabase through the gated
// seller_upsert_product function (supabase/setup.sql).
// Resolves { product, synced, error } — synced=false means the change lives
// in this browser only and the owner should re-run setup.sql / check the key.
export async function saveProduct(input) {
  const products = readStore() || getLocalProducts();
  const images = (Array.isArray(input.images) ? input.images : [])
    .map((src) => String(src || "").trim())
    .filter(Boolean);
  const product = normalizeProduct({
    ...input,
    id: input.id || `p-${Date.now()}`,
    images,
    image: String(input.image || "").trim() || images[0] || "",
    sort_order: input.sort_order || products.length + 1
  });
  const idx = products.findIndex((p) => stringId(p.id) === stringId(product.id));
  if (idx >= 0) products[idx] = { ...products[idx], ...product };
  else products.push(product);
  writeStore(products);

  const result = { product: cloneProduct(product), synced: isDemoMode, error: null };
  if (isDemoMode) return result;

  try {
    const ready = await waitForSupabase();
    const sb = ready ? getSupabaseClient() : null;
    if (!sb) throw new Error("Supabase is not connected.");
    const payload = {
      id: product.id,
      dept: product.dept || "fashion",
      collection: product.collection || "",
      name: product.name,
      description: product.description || "",
      price_ghs: product.price_ghs,
      compare_at_ghs: product.compare_at_ghs == null ? "" : product.compare_at_ghs,
      flash_sale: product.flash_sale === true,
      sizes: product.sizes,
      colors: product.colors,
      badge: product.badge || "",
      in_stock: product.in_stock !== false,
      image: product.image || "",
      images: product.images,
      sort_order: product.sort_order || 0
    };
    const { data, error } = await sb.rpc("seller_upsert_product", {
      p_key: String(CONFIG.sellerKey || ""),
      p_product: payload
    });
    if (error) throw new Error(error.message || "Supabase rejected the save.");
    if (data && typeof data === "object") {
      const saved = normalizeProduct(data);
      const list = readStore() || [];
      const i = list.findIndex((p) => stringId(p.id) === stringId(product.id));
      if (i >= 0) list[i] = saved;
      else list.push(saved);
      writeStore(list);
      result.product = cloneProduct(saved);
    }
    result.synced = true;
  } catch (err) {
    console.error("Product saved in the browser only:", err);
    result.error = err?.message || String(err);
  }
  return result;
}

// Delete a product locally, then from Supabase when connected.
// Resolves { synced, error }.
export async function deleteProduct(id) {
  const products = (readStore() || getLocalProducts())
    .filter((p) => stringId(p.id) !== stringId(id));
  writeStore(products);

  const result = { products: products.map(cloneProduct), synced: isDemoMode, error: null };
  if (isDemoMode) return result;

  try {
    const ready = await waitForSupabase();
    const sb = ready ? getSupabaseClient() : null;
    if (!sb) throw new Error("Supabase is not connected.");
    const { error } = await sb.rpc("seller_delete_product", {
      p_key: String(CONFIG.sellerKey || ""),
      p_id: stringId(id)
    });
    if (error) throw new Error(error.message || "Supabase rejected the delete.");
    result.synced = true;
  } catch (err) {
    console.error("Product deleted in the browser only:", err);
    result.error = err?.message || String(err);
  }
  return result;
}

export async function getProduct(idValue) {
  const products = await loadProducts();
  const wanted = stringId(idValue);
  return products.find((p) => stringId(p.id) === wanted) || null;
}

export async function getProductBySlug(slug) {
  const products = await loadProducts();
  const wanted = String(slug || "");
  return products.find((p) => p.slug === wanted) || null;
}

export function relatedProducts(product, products, limit = 4) {
  if (!product) return [];
  const others = (products || []).filter((p) => (
    stringId(p.id) !== stringId(product.id) && p.in_stock !== false
  ));
  const sameCollection = others.filter((p) => (
    p.dept === product.dept && product.collection && p.collection === product.collection
  ));
  const sameDept = others.filter((p) => p.dept === product.dept);
  const seen = new Set();
  const out = [];
  sameCollection.concat(sameDept, others).forEach((p) => {
    const id = stringId(p.id);
    if (seen.has(id) || out.length >= limit) return;
    seen.add(id);
    out.push(p);
  });
  return out;
}
