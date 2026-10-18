import { isValidDateString } from '../lib/utils';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isMongoId,
} from 'class-validator';
import dayjs from '../lib/custom-dayjs';

@ValidatorConstraint()
export class CommaSeparatedMongoIds implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    if (!value) return true;
    let values = value?.split(',');
    for (let id of values) {
      if (!isMongoId(id.trim())) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Please provide valid comma separated ${validationArguments.property}.`;
  }
}


@ValidatorConstraint()
export class MongoIdArray implements ValidatorConstraintInterface {
  message: string = '';

  validate(
    value: string[],
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {

    const isRequired = validationArguments.constraints;

    if (Array.isArray(isRequired) && isRequired.length && isRequired[0] && !value) {
      this.message = `The '${validationArguments.property}' is required.`;
      return false;
    }

    value.forEach(id => {
      if (!isMongoId(id.trim())) {
        this.message = `Provided value ${id} is not a valid ${validationArguments.property}.`;
        return false;
      }
    })

    return true;
  }

  defaultMessage(): string {
    return this.message || 'Please provide valid date range.';
  }
}


@ValidatorConstraint()
export class ValidateAgainstValues implements ValidatorConstraintInterface {
  message: string = '';

  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    if (!value) return true;
    let values = value.split(',');
    if (!values.length) return true;
    const allowedValues = validationArguments.constraints;

    for (let value of values) {
      if (!allowedValues.includes(value.trim())) {
        this.message = `The value "${value}" is not a valid ${validationArguments.property}.`;
        return false;
      }
    }

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return (
      this.message || 'Please provide valid ' + validationArguments.property
    );
  }
}

@ValidatorConstraint()
export class ValidateNumberRange implements ValidatorConstraintInterface {
  message: string = '';
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    if (!value) return true;

    const range = value.split(',');

    if (range.length !== 2) {
      this.message = `${validationArguments.property} should be a valid range.`;
      return false;
    }

    if (isNaN(Number(range[0])) || isNaN(Number(range[1]))) {
      this.message = `The start and end value of ${validationArguments.property} should be a number.`;
      return false;
    }

    if (Number(range[0]) >= Number(range[1])) {
      this.message = `The start value should be less than the end value of ${validationArguments.property}.`;
      return false;
    }

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return (
      this.message ||
      `The ${validationArguments.property} should be a valid range.`
    );
  }
}

@ValidatorConstraint()
export class ValidateDateRange implements ValidatorConstraintInterface {
  message: string = '';

  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    const date_range = value?.split(',');

    const isRequired = validationArguments.constraints;

    if (Array.isArray(isRequired) && isRequired.length && isRequired[0] && !date_range?.length) {
      this.message = `The '${validationArguments.property}' is required.`;
      return false;
    }


    if (!date_range?.length) return true;

    if (date_range.length > 2) {
      this.message = `The '${validationArguments.property}' cannot contain more than two dates.`;
      return false;
    }

    if (!isValidDateString(date_range[0])) {
      this.message = `The start date of '${validationArguments.property}' must be a valid date.`;
      return false;
    }

    if (
      date_range.length > 1 &&
      !isValidDateString(date_range[0])
    ) {
      this.message = `The end date of '${validationArguments.property}' must be a valid date.`;
      return false;
    }

    // if (date_range.length > 1) {
    //   if (
    //     dayjs(date_range[0]).format('YYYY-MM-DD') ===
    //     dayjs(date_range[1]).format('YYYY-MM-DD')
    //   ) {
    //     this.message = `The start date and end date of '${validationArguments.property}' cannot be the same.`;
    //     return false;
    //   }
    // }

    if (date_range.length === 2) {
      if (isNaN(dayjs(date_range[1]).diff(dayjs(date_range[0]), 'day')) || dayjs(date_range[1]).diff(dayjs(date_range[0]), 'day') < 0) {
        this.message = `The end date of '${validationArguments.property}' must be greater than the start date.`;
        return false;
      }
    }

    return true;
  }

  defaultMessage(): string {
    return this.message || 'Please provide valid date range.';
  }
}