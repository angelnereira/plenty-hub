import Decimal from 'decimal.js';

export type ApiResponse<T> = {
    data?: T;
    error?: string;
    success: boolean;
};

export type DecimalValue = Decimal;
