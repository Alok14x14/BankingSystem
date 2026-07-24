class ApiResponse {
    static success(statusCode = 200, message = 'successful', data = {}) {
        return {
            statusCode,
            status: 'success',
            message,
            data
        };
    }
    
    static error(statusCode = 500, message = 'Internal Server Error', error = null) {
        return {
            statusCode,
            status: 'error',
            message,
            error
        };
    }
}

module.exports = ApiResponse 