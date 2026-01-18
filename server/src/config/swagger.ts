/**
 * Swagger/OpenAPI configuration for API documentation
 */

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '2.0.0',
            description: 'RESTful API for E-Commerce platform with product and variant management',
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Development server' },
        ],
        paths: {
            '/products': {
                get: {
                    summary: 'Get all products',
                    description: 'Retrieve all products with their variants and images. Optionally filter by category.',
                    parameters: [
                        {
                            in: 'query',
                            name: 'category',
                            schema: { type: 'string', enum: ['shoes', 'clothing'] },
                            description: 'Filter products by category',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Successful product list retrieval',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Product' },
                                    },
                                },
                            },
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
                post: {
                    summary: 'Create a new product',
                    description: 'Add a new product with variants to the catalog',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProductInput' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Product successfully created',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Product' },
                                },
                            },
                        },
                        400: {
                            description: 'Validation error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/products/{id}': {
                get: {
                    summary: 'Get product by ID',
                    description: 'Retrieve a single product with all its details',
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' },
                            description: 'Product ID',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Product details',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Product' },
                                },
                            },
                        },
                        404: {
                            description: 'Product not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/categories': {
                get: {
                    summary: 'Get all categories',
                    description: 'Retrieve list of available product categories',
                    responses: {
                        200: {
                            description: 'List of categories',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Variant: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Variant ID' },
                        size: { type: 'string', description: 'Size (numeric for shoes, XS-XL for clothing)' },
                        stock: { type: 'integer', description: 'Available stock quantity' },
                    },
                },
                ProductImage: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Image ID' },
                        url: { type: 'string', description: 'Image URL' },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Product ID' },
                        name: { type: 'string', description: 'Product name' },
                        basePrice: { type: 'number', description: 'Base price in TL' },
                        description: { type: 'string', description: 'Product description' },
                        imageUrl: { type: 'string', description: 'Main product image URL' },
                        category: { type: 'string', enum: ['shoes', 'clothing'], description: 'Product category' },
                        brand: { type: 'string', description: 'Product brand' },
                        createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
                        variants: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Variant' },
                            description: 'Available product variants',
                        },
                        images: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ProductImage' },
                            description: 'Product images',
                        },
                    },
                },
                ProductInput: {
                    type: 'object',
                    required: ['name', 'basePrice', 'category', 'description', 'variants'],
                    properties: {
                        name: { type: 'string', description: 'Product name' },
                        basePrice: { type: 'number', minimum: 0.01, description: 'Base price (must be > 0)' },
                        imageUrl: { type: 'string', description: 'Main image URL (optional if images array provided)' },
                        images: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of image URLs',
                        },
                        category: { type: 'string', enum: ['shoes', 'clothing'], description: 'Product category' },
                        brand: { type: 'string', description: 'Product brand (defaults to "General")' },
                        description: { type: 'string', description: 'Product description' },
                        variants: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                required: ['size'],
                                properties: {
                                    size: { type: 'string', description: 'Size (numeric for shoes, XS-XL for clothing)' },
                                    stock: { type: 'integer', minimum: 0, description: 'Stock quantity (defaults to 1)' },
                                },
                            },
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', description: 'Error message' },
                        details: { type: 'string', description: 'Additional error details' },
                    },
                },
            },
        },
    },
    apis: [],
};
