import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/** 4+ consecutive identical characters (e.g. "aaaa", "!!!!"). */
const REPEATED_CHAR_PATTERN = /(.)\1{3,}/;
/** At least two non-empty tokens separated by whitespace. */
const MULTI_WORD_PATTERN = /\S+\s+\S+/;

export type AddressLineValidationResult =
  | { valid: true }
  | { valid: false; message: string };

/**
 * Street address must look real: multi-word (spaces between words)
 * and no long runs of the same character.
 */
export function validateAddressLine(
  address: unknown,
): AddressLineValidationResult {
  if (typeof address !== 'string' || !address.trim()) {
    return {
      valid: false,
      message: 'Please enter your street address.',
    };
  }

  const trimmed = address.trim();

  if (REPEATED_CHAR_PATTERN.test(trimmed)) {
    return {
      valid: false,
      message:
        'Address cannot contain long runs of the same character.',
    };
  }

  if (!MULTI_WORD_PATTERN.test(trimmed)) {
    return {
      valid: false,
      message:
        'Please enter a complete street address with spaces between words.',
    };
  }

  return { valid: true };
}

@ValidatorConstraint({ name: 'IsValidAddressLine', async: false })
export class IsValidAddressLineConstraint
  implements ValidatorConstraintInterface
{
  private message =
    'Please enter a valid street address with spaces between words.';

  validate(address: unknown) {
    const result = validateAddressLine(address);
    if (result.valid === false) {
      this.message = result.message;
      return false;
    }
    return true;
  }

  defaultMessage() {
    return this.message;
  }
}

export function IsValidAddressLine(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAddressLineConstraint,
    });
  };
}
