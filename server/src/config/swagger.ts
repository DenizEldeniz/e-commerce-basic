/**
 * Swagger/OpenAPI configuration for API documentation
 */

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '1.0.0',
            description: 'RESTful API for E-Commerce platform',
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Development server' },
        ],
    },
    apis: ['./src/routes/*.ts'],
};
