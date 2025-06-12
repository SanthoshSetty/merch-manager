# Google Merchant API Field Mappings Reference

This document provides comprehensive field mappings between form fields and Google Merchant API fields for the Google Merchant API Field Update Interface.

## Overview

The Google Merchant API uses a structured approach where product attributes are nested under the `attributes` object. Each field update requires a proper `updateMask` to specify which fields should be updated.

## Core Product Fields

### Basic Information
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `title` | `attributes.title` | string | Yes | Product title (max 150 chars) |
| `description` | `attributes.description` | string | Yes | Product description (max 5000 chars) |
| `link` | `attributes.link` | string | Yes | Product landing page URL |
| `imageLink` | `attributes.imageLink` | string | Yes | Main product image URL |
| `contentLanguage` | `attributes.contentLanguage` | string | Yes | Content language (e.g., "en") |
| `targetCountry` | `attributes.targetCountry` | string | Yes | Target country (e.g., "US") |
| `channel` | `attributes.channel` | string | Yes | Sales channel ("online" or "local") |
| `brand` | `attributes.brand` | string | Conditional | Product brand name |
| `condition` | `attributes.condition` | string | Yes | "new", "refurbished", "used" |
| `gtin` | `attributes.gtin` | string | Conditional | Global Trade Item Number |
| `mpn` | `attributes.mpn` | string | Conditional | Manufacturer Part Number |
| `itemGroupId` | `attributes.itemGroupId` | string | No | Groups product variants |

### Pricing Fields
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `price.value` | `attributes.price.value` | string | Yes | Price value |
| `price.currency` | `attributes.price.currency` | string | Yes | Currency code (ISO 4217) |
| `salePrice.value` | `attributes.salePrice.value` | string | No | Sale price value |
| `salePrice.currency` | `attributes.salePrice.currency` | string | No | Sale price currency |
| `salePriceEffectiveDate` | `attributes.salePriceEffectiveDate` | string | No | Sale price date range |
| `costOfGoodsSold.value` | `attributes.costOfGoodsSold.value` | string | No | COGS value |
| `costOfGoodsSold.currency` | `attributes.costOfGoodsSold.currency` | string | No | COGS currency |
| `autoPricingMinPrice` | `attributes.autoPricingMinPrice` | string | No | Minimum price for automated discounts |

### Availability & Inventory
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `availability` | `attributes.availability` | string | Yes | "in_stock", "out_of_stock", "preorder", "backorder" |
| `availabilityDate` | `attributes.availabilityDate` | string | No | Availability date (ISO 8601) |
| `quantity` | `attributes.quantity` | integer | No | Available quantity |
| `sellOnGoogleQuantity` | `attributes.sellOnGoogleQuantity` | integer | No | Quantity for Google Shopping |
| `expirationDate` | `attributes.expirationDate` | string | No | Product expiration date |
| `minHandlingTime` | `attributes.minHandlingTime` | integer | No | Minimum processing time (days) |
| `maxHandlingTime` | `attributes.maxHandlingTime` | integer | No | Maximum processing time (days) |

### Enhanced Product Details
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `gender` | `attributes.gender` | string | No | "male", "female", "unisex" |
| `ageGroup` | `attributes.ageGroup` | string | No | "newborn", "infant", "toddler", "kids", "adult" |
| `adult` | `attributes.adult` | boolean | No | Adult content flag |
| `color` | `attributes.color` | string | No | Product color |
| `material` | `attributes.material` | string | No | Product material |
| `pattern` | `attributes.pattern` | string | No | Product pattern |
| `size` | `attributes.size` | string | No | Product size |
| `sizeSystem` | `attributes.sizeSystem` | string | No | Size system used |
| `sizeType` | `attributes.sizeType` | string | No | Size type |

### Physical Properties & Dimensions
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `productWeight.value` | `attributes.productWeight.value` | number | No | Product weight value |
| `productWeight.unit` | `attributes.productWeight.unit` | string | No | Product weight unit |
| `productLength.value` | `attributes.productLength.value` | number | No | Product length value |
| `productLength.unit` | `attributes.productLength.unit` | string | No | Product length unit |
| `productWidth.value` | `attributes.productWidth.value` | number | No | Product width value |
| `productWidth.unit` | `attributes.productWidth.unit` | string | No | Product width unit |
| `productHeight.value` | `attributes.productHeight.value` | number | No | Product height value |
| `productHeight.unit` | `attributes.productHeight.unit` | string | No | Product height unit |
| `shippingWeight.value` | `attributes.shippingWeight.value` | number | No | Shipping weight value |
| `shippingWeight.unit` | `attributes.shippingWeight.unit` | string | No | Weight unit ("g", "kg", "oz", "lb") |
| `shippingLength.value` | `attributes.shippingLength.value` | number | No | Shipping length value |
| `shippingLength.unit` | `attributes.shippingLength.unit` | string | No | Length unit ("in", "cm") |
| `shippingWidth.value` | `attributes.shippingWidth.value` | number | No | Shipping width value |
| `shippingWidth.unit` | `attributes.shippingWidth.unit` | string | No | Width unit |
| `shippingHeight.value` | `attributes.shippingHeight.value` | number | No | Shipping height value |
| `shippingHeight.unit` | `attributes.shippingHeight.unit` | string | No | Height unit |

### Energy & Sustainability
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `energyEfficiencyClass` | `attributes.energyEfficiencyClass` | string | No | Energy efficiency rating |
| `minEnergyEfficiencyClass` | `attributes.minEnergyEfficiencyClass` | string | No | Min energy efficiency rating |
| `maxEnergyEfficiencyClass` | `attributes.maxEnergyEfficiencyClass` | string | No | Max energy efficiency rating |
| `sustainabilityFeatures` | `attributes.sustainabilityFeatures` | array[string] | No | Environmental benefits |
| `recycledContentPercentage` | `attributes.recycledContentPercentage` | number | No | Recycled content percentage |
| `isRecyclable` | `attributes.isRecyclable` | boolean | No | Product recyclability |

### Advanced Shipping & Tax
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `shipping` | `attributes.shipping` | array[object] | No | Shipping rules |
| `shippingLabel` | `attributes.shippingLabel` | string | No | Shipping label |
| `taxes` | `attributes.taxes` | array[object] | No | Tax rules |
| `taxCategory` | `attributes.taxCategory` | string | No | Tax category |
| `vatId` | `attributes.vatId` | string | No | VAT identification number |
| `freeShipping` | `attributes.freeShipping` | boolean | No | Free shipping eligible |
| `shippingRestricted` | `attributes.shippingRestricted` | boolean | No | Shipping restrictions apply |
| `shippingRestrictions` | `attributes.shippingRestrictions` | string | No | Shipping restriction details |

### Product Certifications
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `certifications` | `attributes.certifications` | array[string] | No | Product certifications |
| `safetyWarning` | `attributes.safetyWarning` | string | No | Safety warnings |
| `complianceStandards` | `attributes.complianceStandards` | string | No | Compliance standards |
| `organicCertified` | `attributes.organicCertified` | boolean | No | Organic certification |
| `fairTradeCertified` | `attributes.fairTradeCertified` | boolean | No | Fair trade certification |

### International Trade
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `countryOfOrigin` | `attributes.countryOfOrigin` | string | No | Manufacturing country |
| `hsCode` | `attributes.hsCode` | string | No | Harmonized System code |
| `importExportClassification` | `attributes.importExportClassification` | string | No | Trade classification |
| `customsValue` | `attributes.customsValue` | number | No | Customs declared value |
| `exportRestrictions` | `attributes.exportRestrictions` | string | No | Export restriction details |

### Additional Images
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `additionalImageLinks` | `attributes.additionalImageLinks` | array[string] | No | Additional product images (max 10) |
| `virtualModelLink` | `attributes.virtualModelLink` | string | No | 3D model or AR experience URL |

### Categorization
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `googleProductCategory` | `attributes.googleProductCategory` | string | No | Google product category ID |
| `productTypes` | `attributes.productTypes` | array[string] | No | Custom product categories |
| `customLabels.label0` | `attributes.customLabels.label0` | string | No | Custom label 0 |
| `customLabels.label1` | `attributes.customLabels.label1` | string | No | Custom label 1 |
| `customLabels.label2` | `attributes.customLabels.label2` | string | No | Custom label 2 |
| `customLabels.label3` | `attributes.customLabels.label3` | string | No | Custom label 3 |
| `customLabels.label4` | `attributes.customLabels.label4` | string | No | Custom label 4 |

### SEO & Marketing
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `link` | `attributes.link` | string | Yes | Product landing page URL |
| `mobileLink` | `attributes.mobileLink` | string | No | Mobile-optimized URL |
| `productHighlights` | `attributes.productHighlights` | array[string] | No | Key selling points (max 10) |
| `promotionIds` | `attributes.promotionIds` | array[string] | No | Associated promotion IDs |
| `loyaltyProgram` | `attributes.loyaltyProgram` | object | No | Loyalty program information |

### Advanced Features
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `externalSellerId` | `attributes.externalSellerId` | string | No | Multi-seller marketplace ID |
| `displayAdsId` | `attributes.displayAdsId` | string | No | Dynamic remarketing ID |
| `adsGrouping` | `attributes.adsGrouping` | string | No | Ads grouping identifier |
| `pause` | `attributes.pause` | boolean | No | Pause publication |
| `identifierExists` | `attributes.identifierExists` | boolean | No | Product has unique identifiers |
| `multipack` | `attributes.multipack` | boolean | No | Multipack item |
| `bundle` | `attributes.bundle` | string | No | Bundle description |

## Update Mask Generation

When updating fields, you must provide an `updateMask` parameter that specifies which fields to update. The mask should include the full path to each field:

### Examples:

**Single Field Update:**
```
updateMask: "attributes.title"
```

**Multiple Fields Update:**
```
updateMask: "attributes.title,attributes.price,attributes.availability"
```

**Nested Field Update:**
```
updateMask: "attributes.price.value,attributes.price.currency"
```

**Complex Update with New Custom Fields:**
```
updateMask: "attributes.title,attributes.description,attributes.price.value,attributes.salePrice.value,attributes.availability,attributes.energyEfficiencyClass,attributes.sustainabilityFeatures,attributes.countryOfOrigin"
```

## Field Validation Rules

### Title
- Maximum 150 characters
- Must be descriptive and accurate
- Should not include promotional text

### Description
- Maximum 5,000 characters
- Should be detailed and informative
- HTML tags are not allowed

### Price
- Must be a valid number
- Currency must be ISO 4217 code
- Should include tax where applicable

### GTIN/MPN/Brand
- At least two of these three must be provided
- If none available, set `identifierExists: false`

### Images
- Must be publicly accessible URLs
- Minimum 100x100 pixels
- Maximum 64 megapixels
- Supported formats: JPEG, PNG, GIF, BMP, TIFF, WEBP

### Availability
- Must be one of: "in_stock", "out_of_stock", "preorder", "backorder"
- Should reflect actual inventory status

### Energy Efficiency Classes
- Valid values: A+++, A++, A+, A, B, C, D, E, F, G
- Used for appliances and energy-consuming products

### Dimensions & Weight
- Values must be positive numbers
- Units: in, cm for dimensions; lb, kg, g, oz for weight
- Separate product and shipping dimensions supported

### Certifications
- Include relevant safety, quality, and environmental certifications
- Examples: CE, FCC, UL, ENERGY STAR, ORGANIC, Fair Trade

### International Trade
- Country codes must be ISO 3166-1 alpha-2 format
- HS codes should follow international standards
- Customs values in USD equivalent

## Implementation Notes

1. **Batch Updates**: For multiple field updates, batch them into a single API call when possible
2. **Debouncing**: Implement debouncing for real-time field updates to avoid excessive API calls
3. **Error Handling**: Always validate fields before sending to API
4. **Rate Limiting**: Respect Google's API rate limits
5. **Monitoring**: Track update success/failure rates for debugging
6. **Field Groups**: Use accordion-style UI to organize the 100+ available fields
7. **Progressive Enhancement**: Load fields progressively based on product type

## Comprehensive TypeScript Interfaces

```typescript
interface ProductAttributes {
  // Basic Information
  title?: string;
  description?: string;
  link?: string;
  imageLink?: string;
  brand?: string;
  condition?: 'new' | 'refurbished' | 'used';
  gtin?: string;
  mpn?: string;
  itemGroupId?: string;

  // Pricing
  price?: PriceType;
  salePrice?: PriceType;
  salePriceEffectiveDate?: string;
  costOfGoodsSold?: PriceType;
  autoPricingMinPrice?: PriceType;

  // Availability & Inventory
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  availabilityDate?: string;
  quantity?: number;
  sellOnGoogleQuantity?: number;
  expirationDate?: string;
  minHandlingTime?: number;
  maxHandlingTime?: number;

  // Enhanced Product Details
  gender?: 'male' | 'female' | 'unisex';
  ageGroup?: 'newborn' | 'infant' | 'toddler' | 'kids' | 'adult';
  adult?: boolean;
  color?: string;
  material?: string;
  pattern?: string;
  size?: string;
  sizeSystem?: string;
  sizeType?: string;

  // Physical Properties
  productWeight?: DimensionType;
  productLength?: DimensionType;
  productWidth?: DimensionType;
  productHeight?: DimensionType;
  shippingWeight?: DimensionType;
  shippingLength?: DimensionType;
  shippingWidth?: DimensionType;
  shippingHeight?: DimensionType;

  // Energy & Sustainability
  energyEfficiencyClass?: string;
  minEnergyEfficiencyClass?: string;
  maxEnergyEfficiencyClass?: string;
  sustainabilityFeatures?: string[];
  recycledContentPercentage?: number;
  isRecyclable?: boolean;

  // Shipping & Tax
  shippingLabel?: string;
  taxCategory?: string;
  vatId?: string;
  freeShipping?: boolean;
  shippingRestricted?: boolean;
  shippingRestrictions?: string;

  // Certifications
  certifications?: string[];
  safetyWarning?: string;
  complianceStandards?: string;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;

  // International Trade
  countryOfOrigin?: string;
  hsCode?: string;
  importExportClassification?: string;
  customsValue?: number;
  exportRestrictions?: string;

  // Images & Media
  additionalImageLinks?: string[];
  virtualModelLink?: string;

  // Categorization
  googleProductCategory?: string;
  productTypes?: string[];
  customLabels?: {
    label0?: string;
    label1?: string;
    label2?: string;
    label3?: string;
    label4?: string;
  };

  // SEO & Marketing
  mobileLink?: string;
  productHighlights?: string[];
  promotionIds?: string[];
  loyaltyProgram?: object;

  // Advanced Features
  externalSellerId?: string;
  displayAdsId?: string;
  adsGrouping?: string;
  pause?: boolean;
  identifierExists?: boolean;
  multipack?: boolean;
  bundle?: string;
}

interface PriceType {
  value: string;
  currency: string;
}

interface DimensionType {
  value: number;
  unit: string;
}
```

This comprehensive mapping supports 100+ Google Merchant API fields organized into logical groups for enhanced product management capabilities.
