export const Currencies = [
    { value: 'EUR', label: '€ Euro', locale:"fr-FR" },
    { value: 'USD', label: '$ Dollar', locale:"en-US" },
    { value: 'AUD', label: '$ Dollar australien', locale:"en-AU" },
    { value: 'CAD', label: '$ Dollar canadien', locale:"fr-CA" },
    { value: 'GBP', label: '£ Livre sterling', locale:"en-GB" },
    { value: 'JPY', label: '¥ Yen japonais', locale:"ja-JP" },
    { value: 'CNY', label: '¥ Yuan chinois', locale:"zh-CN" },
    { value: 'INR', label: '₹ Roupie indienne', locale:"hi-IN" },
    { value: 'RUB', label: '₽ Rouble russe', locale:"ru-RU" },
    { value: 'BRL', label: 'R$ Réal brésilien', locale:"pt-BR" },
];

export type Currency = (typeof Currencies)[0];
