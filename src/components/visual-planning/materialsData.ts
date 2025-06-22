export interface Material {
  name: string;
  category: string;
  image: string;
}

export const MATERIALS: Material[] = [
  // Wood
  { name: 'Oak Wood', category: 'Wood', image: '/materials/oak-wood.jpg' },
  { name: 'Walnut Wood', category: 'Wood', image: '/materials/walnut-wood.jpg' },
  { name: 'Pine Wood', category: 'Wood', image: '/materials/pine-wood.jpg' },
  { name: 'Maple Wood', category: 'Wood', image: '/materials/maple-wood.jpg' },
  { name: 'Mahogany', category: 'Wood', image: '/materials/mahogany.jpg' },
  { name: 'Teak', category: 'Wood', image: '/materials/teak.jpg' },
  { name: 'Birch', category: 'Wood', image: '/materials/birch.jpg' },
  { name: 'Ash', category: 'Wood', image: '/materials/ash.jpg' },
  { name: 'Cherry', category: 'Wood', image: '/materials/cherry.jpg' },
  { name: 'Bamboo', category: 'Wood', image: '/materials/bamboo.jpg' },
  // Stone
  { name: 'Carrara Marble', category: 'Stone', image: '/materials/carrara-marble.jpg' },
  { name: 'Granite', category: 'Stone', image: '/materials/granite.jpg' },
  { name: 'Slate', category: 'Stone', image: '/materials/slate.jpg' },
  { name: 'Limestone', category: 'Stone', image: '/materials/limestone.jpg' },
  { name: 'Travertine', category: 'Stone', image: '/materials/travertine.jpg' },
  { name: 'Quartzite', category: 'Stone', image: '/materials/quartzite.jpg' },
  { name: 'Onyx', category: 'Stone', image: '/materials/onyx.jpg' },
  { name: 'Terrazzo', category: 'Stone', image: '/materials/terrazzo.jpg' },
  // Metal
  { name: 'Brass', category: 'Metal', image: '/materials/brass.jpg' },
  { name: 'Copper', category: 'Metal', image: '/materials/copper.jpg' },
  { name: 'Stainless Steel', category: 'Metal', image: '/materials/stainless-steel.jpg' },
  { name: 'Bronze', category: 'Metal', image: '/materials/bronze.jpg' },
  { name: 'Aluminum', category: 'Metal', image: '/materials/aluminum.jpg' },
  { name: 'Iron', category: 'Metal', image: '/materials/iron.jpg' },
  { name: 'Gold', category: 'Metal', image: '/materials/gold.jpg' },
  { name: 'Chrome', category: 'Metal', image: '/materials/chrome.jpg' },
  // Glass
  { name: 'Clear Glass', category: 'Glass', image: '/materials/clear-glass.jpg' },
  { name: 'Frosted Glass', category: 'Glass', image: '/materials/frosted-glass.jpg' },
  { name: 'Tinted Glass', category: 'Glass', image: '/materials/tinted-glass.jpg' },
  { name: 'Stained Glass', category: 'Glass', image: '/materials/stained-glass.jpg' },
  { name: 'Textured Glass', category: 'Glass', image: '/materials/textured-glass.jpg' },
  // Fabric
  { name: 'Linen', category: 'Fabric', image: '/materials/linen.jpg' },
  { name: 'Velvet', category: 'Fabric', image: '/materials/velvet.jpg' },
  { name: 'Cotton', category: 'Fabric', image: '/materials/cotton.jpg' },
  { name: 'Wool', category: 'Fabric', image: '/materials/wool.jpg' },
  { name: 'Leather', category: 'Fabric', image: '/materials/leather.jpg' },
  { name: 'Suede', category: 'Fabric', image: '/materials/suede.jpg' },
  { name: 'Silk', category: 'Fabric', image: '/materials/silk.jpg' },
  { name: 'Canvas', category: 'Fabric', image: '/materials/canvas.jpg' },
  { name: 'Denim', category: 'Fabric', image: '/materials/denim.jpg' },
  { name: 'Faux Fur', category: 'Fabric', image: '/materials/faux-fur.jpg' },
  // Tile
  { name: 'Ceramic Tile', category: 'Tile', image: '/materials/ceramic-tile.jpg' },
  { name: 'Porcelain Tile', category: 'Tile', image: '/materials/porcelain-tile.jpg' },
  { name: 'Mosaic Tile', category: 'Tile', image: '/materials/mosaic-tile.jpg' },
  { name: 'Subway Tile', category: 'Tile', image: '/materials/subway-tile.jpg' },
  { name: 'Cement Tile', category: 'Tile', image: '/materials/cement-tile.jpg' },
  { name: 'Glass Tile', category: 'Tile', image: '/materials/glass-tile.jpg' },
  { name: 'Terracotta Tile', category: 'Tile', image: '/materials/terracotta-tile.jpg' },
  // Concrete/Plaster
  { name: 'Polished Concrete', category: 'Concrete', image: '/materials/polished-concrete.jpg' },
  { name: 'Exposed Concrete', category: 'Concrete', image: '/materials/exposed-concrete.jpg' },
  { name: 'Stucco', category: 'Concrete', image: '/materials/stucco.jpg' },
  { name: 'Venetian Plaster', category: 'Concrete', image: '/materials/venetian-plaster.jpg' },
  // Paint/Wallcovering
  { name: 'Matte Paint', category: 'Paint', image: '/materials/matte-paint.jpg' },
  { name: 'Satin Paint', category: 'Paint', image: '/materials/satin-paint.jpg' },
  { name: 'Gloss Paint', category: 'Paint', image: '/materials/gloss-paint.jpg' },
  { name: 'Patterned Wallpaper', category: 'Paint', image: '/materials/patterned-wallpaper.jpg' },
  { name: 'Textured Wallpaper', category: 'Paint', image: '/materials/textured-wallpaper.jpg' },
  { name: 'Grasscloth', category: 'Paint', image: '/materials/grasscloth.jpg' },
  // Plastic/Resin
  { name: 'Acrylic', category: 'Plastic', image: '/materials/acrylic.jpg' },
  { name: 'Polycarbonate', category: 'Plastic', image: '/materials/polycarbonate.jpg' },
  { name: 'Epoxy Resin', category: 'Plastic', image: '/materials/epoxy-resin.jpg' },
  // Natural
  { name: 'Rattan', category: 'Natural', image: '/materials/rattan.jpg' },
  { name: 'Cane', category: 'Natural', image: '/materials/cane.jpg' },
  { name: 'Cork', category: 'Natural', image: '/materials/cork.jpg' },
  { name: 'Jute', category: 'Natural', image: '/materials/jute.jpg' },
  { name: 'Sisal', category: 'Natural', image: '/materials/sisal.jpg' },
  { name: 'Seagrass', category: 'Natural', image: '/materials/seagrass.jpg' },
  // Composite/Engineered
  { name: 'MDF', category: 'Composite', image: '/materials/mdf.jpg' },
  { name: 'Plywood', category: 'Composite', image: '/materials/plywood.jpg' },
  { name: 'Laminate', category: 'Composite', image: '/materials/laminate.jpg' },
  { name: 'Engineered Quartz', category: 'Composite', image: '/materials/engineered-quartz.jpg' },
]; 