# Material Picker Update Script

This script automatically updates the material picker modal in the spatial planning tool when you add new pattern files.

## Usage

### Quick Start
```bash
npm run update-materials
```

### Direct Usage
```bash
node scripts/update-material-picker.js
```

## What it does

1. **Scans Pattern Files**: Automatically discovers all `.png` pattern files in `/public/patterns/`
2. **Categorizes Materials**: Groups patterns by type (wood, ceramic, stone, etc.)
3. **Updates Fallback Colors**: Generates appropriate fallback colors for each pattern
4. **Generates Modal Code**: Creates the JSX code for the material picker modal
5. **Updates Canvas.tsx**: Automatically updates the Canvas component with new patterns
6. **Creates Backup**: Saves a backup of the original Canvas.tsx file

## Pattern File Naming Convention

Pattern files should follow this naming convention:
- `MaterialType-##.png` (e.g., `Wood-01.png`, `Ceramic-07.png`, `Stone-03.png`)
- The script automatically extracts the material type and pattern ID from the filename

## Supported Material Types

The script comes pre-configured with color schemes for:
- **Wood**: Various wood tones (oak, mahogany, pine, etc.)
- **Ceramic**: Light grays and whites for tile patterns
- **Stone**: Natural stone colors (slate, granite, etc.)

## Adding New Materials

To add a new material type:

1. Add your pattern files to `/public/patterns/` following the naming convention
2. Run the update script: `npm run update-materials`
3. The script will automatically:
   - Detect the new material type
   - Generate appropriate fallback colors
   - Update the modal code
   - Create TypeScript type definitions

## Example Output

```
🚀 Material Picker Update Script
════════════════════════════════════════
🔍 Scanning pattern files...
📋 Found patterns:
  ceramic: 1 patterns
    - Ceramic-07
  wood: 6 patterns
    - Wood-01
    - Wood-02
    - Wood-03
    - Wood-04
    - Wood-05
    - Wood-06
📝 Generating TypeScript type definitions...
✅ Canvas.tsx updated successfully!
```

## Files Modified

- `src/components/ai-companion/Canvas.tsx` - Updated with new patterns
- `src/components/ai-companion/Canvas.tsx.backup` - Backup of original file

## Customization

You can customize the script by editing:
- `MATERIAL_COLORS` object - Add custom colors for new material types
- `get*Comment()` functions - Add descriptive names for patterns
- Pattern naming logic - Modify how material types are extracted from filenames

## Troubleshooting

- **No patterns found**: Check that pattern files are in `/public/patterns/` with `.png` extension
- **Script fails**: Check that `src/components/ai-companion/Canvas.tsx` exists
- **Colors not right**: Update the `MATERIAL_COLORS` object in the script

## Integration

The script integrates with your existing spatial planning tool by:
- Maintaining compatibility with existing fill elements
- Preserving the current modal structure
- Adding new patterns without breaking existing functionality 