import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PincodeService } from '../pincode.service';

// Global instance to be set by the module
let globalPincodeService: PincodeService | null = null;

export function setGlobalPincodeService(service: PincodeService) {
  globalPincodeService = service;
}

@ValidatorConstraint({ name: 'IsValidPincode', async: true })
@Injectable()
export class IsValidPincodeConstraint implements ValidatorConstraintInterface {
  async validate(pincode: string) {
    if (!pincode || typeof pincode !== 'string') {
      return false;
    }
    if (!globalPincodeService) {
      return true; // Skip validation if service is not available
    }
    return globalPincodeService.isValidPincode(pincode);
  }

  defaultMessage() {
    return 'Invalid pincode. Please provide a valid Indian pincode.';
  }
}

export function IsValidPincode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPincodeConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsCityValidForPincode', async: true })
@Injectable()
export class IsCityValidForPincodeConstraint
  implements ValidatorConstraintInterface
{
  async validate(city: string, args: ValidationArguments) {
    if (!city || typeof city !== 'string') {
      return false;
    }

    const object = args.object as any;
    const pincode = object.zip_code;

    if (!pincode) {
      return true; // Let the pincode validator handle this
    }

    if (!globalPincodeService) {
      return true; // Skip validation if service is not available
    }

    // Soften: skip city match when pin is absent from local pincodes.json
    // (Delhivery is the PIN source of truth for deliverability).
    if (!globalPincodeService.isValidPincode(pincode)) {
      return true;
    }

    return globalPincodeService.isValidCityForPincode(pincode, city);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;
    const pincode = object.zip_code || object.pincode;
    
    if (pincode && globalPincodeService) {
      try {
        const validCities = globalPincodeService.getCitiesForPincode(pincode);
        if (validCities.length > 0) {
          return `City does not match the pincode. Valid cities for pincode ${pincode}: ${validCities.join(', ')}`;
        }
      } catch (error) {
        // Fallback if pincodeService is not available
      }
    }

    return 'City does not match the provided pincode.';
  }
}

export function IsCityValidForPincode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCityValidForPincodeConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsStateValidForPincode', async: true })
@Injectable()
export class IsStateValidForPincodeConstraint
  implements ValidatorConstraintInterface
{
  async validate(state: string, args: ValidationArguments) {
    if (!state || typeof state !== 'string') {
      return false;
    }

    const object = args.object as any;
    const pincode = object.zip_code;

    if (!pincode) {
      return true; // Let the pincode validator handle this
    }

    if (!globalPincodeService) {
      return true; // Skip validation if service is not available
    }

    // Soften: skip state match when pin is absent from local pincodes.json
    if (!globalPincodeService.isValidPincode(pincode)) {
      return true;
    }

    return globalPincodeService.isValidStateForPincode(pincode, state);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;
    const pincode = object.zip_code || object.pincode;
    
    if (pincode && globalPincodeService) {
      try {
        const validStates = globalPincodeService.getStatesForPincode(pincode);
        if (validStates.length > 0) {
          return `State does not match the pincode. Valid states for pincode ${pincode}: ${validStates.join(', ')}`;
        }
      } catch (error) {
        // Fallback if pincodeService is not available
      }
    }

    return 'State does not match the provided pincode.';
  }
}

export function IsStateValidForPincode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStateValidForPincodeConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsAddressValidForPincode', async: true })
@Injectable()
export class IsAddressValidForPincodeConstraint
  implements ValidatorConstraintInterface
{
  async validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const pincode = object.zip_code || object.pincode;
    const city = object.city;
    const state = object.state;

    if (!pincode || !city || !state) {
      return true; // Let individual validators handle missing fields
    }

    if (!globalPincodeService) {
      return true; // Skip validation if service is not available
    }

    // Soften: skip combo check when pin is absent from local pincodes.json
    if (!globalPincodeService.isValidPincode(pincode)) {
      return true;
    }

    return globalPincodeService.isValidCityStateForPincode(pincode, city, state);
  }

  defaultMessage() {
    return 'The combination of pincode, city, and state is invalid.';
  }
}

export function IsAddressValidForPincode(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAddressValidForPincodeConstraint,
    });
  };
}
