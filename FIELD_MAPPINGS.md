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

### Availability & Inventory
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `availability` | `attributes.availability` | string | Yes | "in_stock", "out_of_stock", "preorder", "backorder" |
| `availabilityDate` | `attributes.availabilityDate` | string | No | Availability date (ISO 8601) |
| `quantity` | `attributes.quantity` | integer | No | Available quantity |
| `sellOnGoogleQuantity` | `attributes.sellOnGoogleQuantity` | integer | No | Quantity for Google Shopping |

### Product Identifiers
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `gtin` | `attributes.gtin` | string | Conditional | Global Trade Item Number |
| `mpn` | `attributes.mpn` | string | Conditional | Manufacturer Part Number |
| `brand` | `attributes.brand` | string | Conditional | Brand name |
| `identifierExists` | `attributes.identifierExists` | boolean | No | Whether product has unique identifiers |

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

### Product Condition & Quality
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `condition` | `attributes.condition` | string | Yes | "new", "refurbished", "used" |
| `adult` | `attributes.adult` | boolean | No | Adult content flag |
| `ageGroup` | `attributes.ageGroup` | string | No | "newborn", "infant", "toddler", "kids", "adult" |
| `color` | `attributes.color` | string | No | Product color |
| `gender` | `attributes.gender` | string | No | "male", "female", "unisex" |
| `material` | `attributes.material` | string | No | Product material |
| `pattern` | `attributes.pattern` | string | No | Product pattern |
| `size` | `attributes.size` | string | No | Product size |
| `sizeSystem` | `attributes.sizeSystem` | string | No | Size system used |
| `sizeType` | `attributes.sizeType` | string | No | Size type |

### Physical Properties
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `shippingWeight.value` | `attributes.shippingWeight.value` | number | No | Shipping weight value |
| `shippingWeight.unit` | `attributes.shippingWeight.unit` | string | No | Weight unit ("g", "kg", "oz", "lb") |
| `shippingLength.value` | `attributes.shippingLength.value` | number | No | Shipping length value |
| `shippingLength.unit` | `attributes.shippingLength.unit` | string | No | Length unit ("in", "cm") |
| `shippingWidth.value` | `attributes.shippingWidth.value` | number | No | Shipping width value |
| `shippingWidth.unit` | `attributes.shippingWidth.unit` | string | No | Width unit |
| `shippingHeight.value` | `attributes.shippingHeight.value` | number | No | Shipping height value |
| `shippingHeight.unit` | `attributes.shippingHeight.unit` | string | No | Height unit |
| `productWeight.value` | `attributes.productWeight.value` | number | No | Product weight value |
| `productWeight.unit` | `attributes.productWeight.unit` | string | No | Product weight unit |
| `productLength.value` | `attributes.productLength.value` | number | No | Product length value |
| `productLength.unit` | `attributes.productLength.unit` | string | No | Product length unit |
| `productWidth.value` | `attributes.productWidth.value` | number | No | Product width value |
| `productWidth.unit` | `attributes.productWidth.unit` | string | No | Product width unit |
| `productHeight.value` | `attributes.productHeight.value` | number | No | Product height value |
| `productHeight.unit` | `attributes.productHeight.unit` | string | No | Product height unit |

### Shipping & Tax
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `shipping` | `attributes.shipping` | array[object] | No | Shipping rules |
| `shippingLabel` | `attributes.shippingLabel` | string | No | Shipping label |
| `taxes` | `attributes.taxes` | array[object] | No | Tax rules |
| `taxCategory` | `attributes.taxCategory` | string | No | Tax category |

### Additional Images
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `additionalImageLinks` | `attributes.additionalImageLinks` | array[string] | No | Additional product images (max 10) |

### Energy & Sustainability
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `energyEfficiencyClass` | `attributes.energyEfficiencyClass` | string | No | Energy efficiency rating |
| `minEnergyEfficiencyClass` | `attributes.minEnergyEfficiencyClass` | string | No | Min energy efficiency rating |
| `maxEnergyEfficiencyClass` | `attributes.maxEnergyEfficiencyClass` | string | No | Max energy efficiency rating |

### Promotion & Marketing
| Form Field | API Field Path | Type | Required | Description |
|------------|----------------|------|----------|-------------|
| `promotionIds` | `attributes.promotionIds` | array[string] | No | Associated promotion IDs |
| `loyaltyProgram` | `attributes.loyaltyProgram` | object | No | Loyalty program information |

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

**Complex Update:**
```
updateMask: "attributes.title,attributes.description,attributes.price.value,attributes.salePrice.value,attributes.availability"
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

## Implementation Notes

1. **Batch Updates**: For multiple field updates, batch them into a single API call when possible
2. **Debouncing**: Implement debouncing for real-time field updates to avoid excessive API calls
3. **Error Handling**: Always validate fields before sending to API
4. **Rate Limiting**: Respect Google's API rate limits
5. **Monitoring**: Track update success/failure rates for debugging

## TypeScript Interfaces

```typescript
interface ProductAttributes {
  title?: string;
  description?: string;
  link?: string;
  imageLink?: string;
  price?: PriceType;
  salePrice?: PriceType;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  condition?: 'new' | 'refurbished' | 'used';
  brand?: string;
  gtin?: string;
  mpn?: string;
  googleProductCategory?: string;
  // ... other fields
}

interface PriceType {
  value: string;
  currency: string;
}
```

This comprehensive mapping ensures proper integration between your form fields and the Google Merchant API.
