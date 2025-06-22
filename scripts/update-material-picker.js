#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const PATTERNS_DIR = path.join(__dirname, '../public/patterns');
const CANVAS_FILE = path.join(__dirname, '../src/components/ai-companion/Canvas.tsx');

// Color mappings for different materials
const MATERIAL_COLORS = {
  wood: {
    'Wood-01': '#D2B48C', // Classic Oak - tan
    'Wood-02': '#A0522D', // Modern Plank - sienna
    'Wood-03': '#DEB887', // Rustic Pine - burlywood
    'Wood-04': '#8B4513', // Mahogany - saddle brown
    'Wood-05': '#CD853F', // Bamboo - peru
    'Wood-06': '#654321', // Walnut - dark brown
    'Wood-07': '#8B7355', // Teak - dark khaki
    'Wood-08': '#D2691E', // Cherry - chocolate
    'Wood-09': '#F4A460', // Birch - sandy brown
    'Wood-10': '#B8860B', // Maple - dark goldenrod
  },
  ceramic: {
    'Ceramic-01': '#F5F5F5', // White
    'Ceramic-02': '#F0F0F0', // Light gray
    'Ceramic-03': '#E8E8E8', // Silver
    'Ceramic-04': '#DCDCDC', // Gainsboro
    'Ceramic-05': '#D3D3D3', // Light gray
    'Ceramic-06': '#C0C0C0', // Silver
    'Ceramic-07': '#F2F2F2', // Very light gray
    'Ceramic-08': '#FAFAFA', // Snow
    'Ceramic-09': '#F8F8F8', // Ghost white
    'Ceramic-10': '#EEEEEE', // Light gray
  },
  stone: {
    'Stone-01': '#708090', // Slate gray
    'Stone-02': '#696969', // Dim gray
    'Stone-03': '#778899', // Light slate gray
    'Stone-04': '#2F4F4F', // Dark slate gray
    'Stone-05': '#B0C4DE', // Light steel blue
    'Stone-06': '#D2B48C', // Tan
    'Stone-07': '#F5DEB3', // Wheat
    'Stone-08': '#DEB887', // Burlywood
    'Stone-09': '#D2691E', // Chocolate
    'Stone-10': '#A0522D', // Sienna
  }
};

function scanPatternFiles() {
  console.log('🔍 Scanning pattern files...');
  
  if (!fs.existsSync(PATTERNS_DIR)) {
    console.error(`❌ Patterns directory not found: ${PATTERNS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(PATTERNS_DIR);
  const patterns = {};

  files.forEach(file => {
    if (file.endsWith('.png')) {
      const baseName = file.replace('.png', '');
      const parts = baseName.split('-');
      
      if (parts.length >= 2) {
        const materialType = parts[0].toLowerCase();
        const patternId = baseName;
        
        if (!patterns[materialType]) {
          patterns[materialType] = [];
        }
        
        patterns[materialType].push({
          id: patternId,
          name: baseName,
          file: file
        });
      }
    }
  });

  // Sort patterns by ID number
  Object.keys(patterns).forEach(materialType => {
    patterns[materialType].sort((a, b) => {
      const aNum = parseInt(a.id.split('-')[1]) || 0;
      const bNum = parseInt(b.id.split('-')[1]) || 0;
      return aNum - bNum;
    });
  });

  console.log('📋 Found patterns:');
  Object.entries(patterns).forEach(([type, items]) => {
    console.log(`  ${type}: ${items.length} patterns`);
    items.forEach(item => console.log(`    - ${item.id}`));
  });

  return patterns;
}

function generateFallbackColors(patterns) {
  console.log('🎨 Generating fallback colors...');
  
  let colorCode = '';
  
  Object.entries(patterns).forEach(([materialType, items]) => {
    const materialColors = MATERIAL_COLORS[materialType] || {};
    
    colorCode += `        if (materialType === '${materialType}') {\n`;
    colorCode += `          switch (patternId) {\n`;
    
    items.forEach(item => {
      const color = materialColors[item.id] || '#DEB887'; // Default fallback
      const comment = materialType === 'wood' ? getWoodComment(item.id) : 
                     materialType === 'ceramic' ? getCeramicComment(item.id) :
                     materialType === 'stone' ? getStoneComment(item.id) : '';
      colorCode += `            case '${item.id}': return '${color}';${comment ? ` // ${comment}` : ''}\n`;
    });
    
    colorCode += `            default: return '#DEB887';\n`;
    colorCode += `          }\n`;
    colorCode += `        } else `;
  });
  
  // Remove the last "else" and add final fallback
  colorCode = colorCode.replace(/ else $/, '');
  colorCode += ` {\n          return '#F5F5F5'; // Default fallback\n        }`;
  
  return colorCode;
}

function getWoodComment(id) {
  const comments = {
    'Wood-01': 'Classic Oak - tan',
    'Wood-02': 'Modern Plank - sienna', 
    'Wood-03': 'Rustic Pine - burlywood',
    'Wood-04': 'Mahogany - saddle brown',
    'Wood-05': 'Bamboo - peru',
    'Wood-06': 'Walnut - dark brown',
    'Wood-07': 'Teak - dark khaki',
    'Wood-08': 'Cherry - chocolate',
    'Wood-09': 'Birch - sandy brown',
    'Wood-10': 'Maple - dark goldenrod'
  };
  return comments[id] || '';
}

function getCeramicComment(id) {
  const comments = {
    'Ceramic-01': 'White',
    'Ceramic-02': 'Light gray',
    'Ceramic-03': 'Silver',
    'Ceramic-04': 'Gainsboro',
    'Ceramic-05': 'Light gray',
    'Ceramic-06': 'Silver',
    'Ceramic-07': 'Very light gray',
    'Ceramic-08': 'Snow',
    'Ceramic-09': 'Ghost white',
    'Ceramic-10': 'Light gray'
  };
  return comments[id] || '';
}

function getStoneComment(id) {
  const comments = {
    'Stone-01': 'Slate gray',
    'Stone-02': 'Dim gray',
    'Stone-03': 'Light slate gray',
    'Stone-04': 'Dark slate gray',
    'Stone-05': 'Light steel blue',
    'Stone-06': 'Tan',
    'Stone-07': 'Wheat',
    'Stone-08': 'Burlywood',
    'Stone-09': 'Chocolate',
    'Stone-10': 'Sienna'
  };
  return comments[id] || '';
}

function generateModalCode(patterns) {
  console.log('🏗️ Generating modal code...');
  
  let modalCode = '';
  
  Object.entries(patterns).forEach(([materialType, items]) => {
    const capitalizedType = materialType.charAt(0).toUpperCase() + materialType.slice(1);
    
    modalCode += `                    <div className="mb-6">\n`;
    modalCode += `                      <h3 className="text-lg font-semibold text-gray-800 mb-3">${capitalizedType} Patterns</h3>\n`;
    modalCode += `                      <div className="grid grid-cols-3 gap-3">\n`;
    modalCode += `                        {[\n`;
    
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      modalCode += `                          { id: '${item.id}', name: '${item.name}', file: '${item.file}' }${isLast ? '' : ','}\n`;
    });
    
    modalCode += `                        ].map((${materialType}) => {\n`;
    modalCode += `                          const isSelected = pendingFill?.materialType === '${materialType}' && pendingFill?.patternId === ${materialType}.id;\n`;
    modalCode += `                          return (\n`;
    modalCode += `                            <div\n`;
    modalCode += `                              key={${materialType}.id}\n`;
    modalCode += `                              onClick={() => handleMaterialSelect('${materialType}', ${materialType}.id)}\n`;
    modalCode += `                              className={\`relative bg-white border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-lg \${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}\`}\n`;
    modalCode += `                            >\n`;
    modalCode += `                              <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">\n`;
    modalCode += `                                <PatternThumbnail patternFile={${materialType}.file} />\n`;
    modalCode += `                              </div>\n`;
    modalCode += `                              <p className="text-sm font-medium text-gray-700 text-center">{${materialType}.name}</p>\n`;
    modalCode += `                              {isSelected && (\n`;
    modalCode += `                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">\n`;
    modalCode += `                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">\n`;
    modalCode += `                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />\n`;
    modalCode += `                                  </svg>\n`;
    modalCode += `                                </div>\n`;
    modalCode += `                              )}\n`;
    modalCode += `                            </div>\n`;
    modalCode += `                          );\n`;
    modalCode += `                        })}\n`;
    modalCode += `                      </div>\n`;
    modalCode += `                    </div>\n\n`;
  });
  
  return modalCode.trim();
}

function updateCanvasFile(patterns) {
  console.log('📝 Updating Canvas.tsx...');
  
  if (!fs.existsSync(CANVAS_FILE)) {
    console.error(`❌ Canvas file not found: ${CANVAS_FILE}`);
    process.exit(1);
  }

  let content = fs.readFileSync(CANVAS_FILE, 'utf8');
  
  // Generate new fallback colors
  const newFallbackColors = generateFallbackColors(patterns);
  
  // Update getFallbackColor function
  const fallbackColorRegex = /const getFallbackColor = \(materialType: string, patternId: string\) => \{[\s\S]*?return '#F5F5F5'; \/\/ Default fallback\s*\n\s*\}/;
  const newFallbackFunction = `const getFallbackColor = (materialType: string, patternId: string) => {
        // Handle old fills without materialType
        if (!materialType) {
          return '#DEB887'; // Default wood color for old fills
        }
        
        ${newFallbackColors}
      }`;
  
  content = content.replace(fallbackColorRegex, newFallbackFunction);
  
  // Generate new modal code
  const newModalCode = generateModalCode(patterns);
  
  // Create a backup
  const backupFile = CANVAS_FILE + '.backup';
  fs.writeFileSync(backupFile, content);
  console.log(`📄 Created backup: ${backupFile}`);
  
  // Write the updated content
  fs.writeFileSync(CANVAS_FILE, content);
  
  console.log('✅ Canvas.tsx updated successfully!');
  
  // Output the new modal code for manual insertion if needed
  console.log('\n📋 Generated modal code (for manual insertion if needed):');
  console.log('─'.repeat(80));
  console.log(newModalCode);
  console.log('─'.repeat(80));
}

function generateTypeDefinitions(patterns) {
  console.log('📝 Generating TypeScript type definitions...');
  
  const materialTypes = Object.keys(patterns).map(type => `'${type}'`).join(' | ');
  const allPatternIds = [];
  
  Object.values(patterns).forEach(items => {
    items.forEach(item => allPatternIds.push(`'${item.id}'`));
  });
  
  const patternIds = allPatternIds.join(' | ');
  
  console.log('\n🔧 TypeScript definitions:');
  console.log('─'.repeat(50));
  console.log(`type MaterialType = ${materialTypes};`);
  console.log(`type PatternId = ${patternIds};`);
  console.log('─'.repeat(50));
}

function main() {
  console.log('🚀 Material Picker Update Script');
  console.log('═'.repeat(40));
  
  try {
    // Scan pattern files
    const patterns = scanPatternFiles();
    
    if (Object.keys(patterns).length === 0) {
      console.log('⚠️ No pattern files found!');
      return;
    }
    
    // Generate type definitions
    generateTypeDefinitions(patterns);
    
    // Update Canvas file
    updateCanvasFile(patterns);
    
    console.log('\n🎉 Material picker update completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Review the generated modal code above');
    console.log('2. Update the FillElement interface materialType if needed');
    console.log('3. Test the updated material picker');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  scanPatternFiles,
  generateFallbackColors,
  generateModalCode,
  updateCanvasFile
}; 