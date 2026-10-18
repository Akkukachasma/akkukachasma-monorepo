import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as dayjs from 'dayjs';

@ValidatorConstraint()
export class ValidateWorkingDuration implements ValidatorConstraintInterface {
  message: string = '';

  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    if (!value) return true;
    const values = value.split(',');
    for (let workingDuration of values) {
      if (
        !workingDuration.trim().includes('month') &&
        !workingDuration.trim().includes('year') &&
        workingDuration !== '5plus'
      ) {
        this.message = "Working duration can only contain items containing month, year or can be '5plus'.";
        return false;
      }
    }
    return true;
  }

  defaultMessage(): string {
    return this.message || 'Please provide valid working durations';
  }
}

@ValidatorConstraint()
export class ValidateContractExpirationRange
  implements ValidatorConstraintInterface {
  message: string = '';

  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    if (!value) return true;
    const values = value.split(',');
    if (!values.length) return true;
    if (values.length > 2) {
      this.message =
        'The working duration date range cannot contain more than two elements.';
      return false;
    }

    if (dayjs(values[0]).format() === 'Invalid Date') {
      this.message = "Working duration's start date must be a valid date";
      return false;
    }

    if (values.length > 1 && dayjs(values[1]).format() === 'Invalid Date') {
      this.message = "Working duration's end date must be a valid date";
      return false;
    }

    if (values.length > 1) {
      if (
        dayjs(values[0]).format('YYYY-MM-DD') ===
        dayjs(values[1]).format('YYYY-MM-DD')
      ) {
        this.message =
          "Working duration's start date and end date cannot be the same";
        return false;
      }
    }

    return true;
  }

  defaultMessage(): string {
    return this.message || 'Please provide valid working duration';
  }
}
