export const CARD_NUMBER_LENGTH = 8

export function formatCardNumber(value: string) {
    const significantDigits = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, CARD_NUMBER_LENGTH)

    if (!significantDigits) {
        return ''
    }

    return significantDigits.padStart(CARD_NUMBER_LENGTH, '0')
}

export function normalizeCardNumber(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, CARD_NUMBER_LENGTH)

    if (!digits) {
        return ''
    }

    return digits.padStart(CARD_NUMBER_LENGTH, '0')
}
