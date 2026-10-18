import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { PincodeService } from './pincode.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { DelhiveryService } from '../delhivery/delhivery.service';

@ApiTags('Address Management')
@Controller('addresses')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly pincodeService: PincodeService,
    private readonly delhiveryService: DelhiveryService,
  ) {}

  @Post()
  @Roles('customer')
  @ApiOperation({ description: 'Create a new address for logged in user' })
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const addresses = await this.addressService.findAll(tenant.id);
    if (addresses.length === 5) {
      throw new BadRequestException(
        'Maximum address limit reached. You can only have maximum 5 addresses',
      );
    }

    if (createAddressDto.label !== 'other') {
      const address = await this.addressService.findOneByLabel({
        label: createAddressDto.label,
        user_id: tenant.id,
      });
      if (address)
        throw new BadRequestException(
          `You have already added ${createAddressDto.label} address`,
        );
    }

    await this.delhiveryService.assertPincodeDeliverable(
      createAddressDto.zip_code,
      {
        allowUnverified: true,
        acknowledgeUnverified: !!createAddressDto.acknowledge_unverified_pincode,
      },
    );

    const created = await this.addressService.create({
      user_id: tenant.id,
      createAddressDto,
    });
    return {
      success: true,
      data: created,
      message: 'Address created successfully',
    };
  }

  @Get()
  @Roles('customer')
  @ApiOperation({ description: 'Fetch all addresses of logged in user' })
  async getAllAddresses(@Tenant() tenant: ITenant): Promise<ApiResponse> {
    const addresses = await this.addressService.findAll(tenant.id);
    return {
      success: true,
      data: addresses,
      message: 'Addresses retrieved successfully',
    };
  }

  @Put(':id')
  @Roles('customer')
  @ApiOperation({ description: 'Use to update an address by its id' })
  async updateAddress(
    @Param() params: RequiredIdDto,
    @Body() updateAddressDto: UpdateAddressDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const owned = await this.addressService.isUserAddress(
      tenant.id,
      params.id,
    );
    if (!owned) {
      throw new NotFoundException('Address not found');
    }

    if (updateAddressDto.label && updateAddressDto.label !== 'other') {
      const duplicate = await this.addressService.findOneByLabel({
        user_id: tenant.id,
        label: updateAddressDto.label,
        address_id: params.id,
      });
      if (duplicate) {
        throw new BadRequestException(
          `You have already added ${updateAddressDto.label} address`,
        );
      }
    }

    const zipCode = (
      updateAddressDto.zip_code ?? owned.zip_code ?? ''
    ).trim();
    if (zipCode) {
      await this.delhiveryService.assertPincodeDeliverable(zipCode, {
        allowUnverified: true,
        acknowledgeUnverified:
          !!updateAddressDto.acknowledge_unverified_pincode,
      });
    }

    const updated = await this.addressService.update({
      address_id: params.id,
      updateAddressDto,
    });

    return {
      success: true,
      data: updated,
      message: 'Address updated successfully',
    };
  }

  @Delete(':id')
  @Roles('customer')
  @ApiOperation({ description: 'Use to delete an address by its id' })
  async deleteAddress(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const owned = await this.addressService.isUserAddress(
      tenant.id,
      params.id,
    );
    if (!owned) {
      throw new NotFoundException('Address not found');
    }

    const deleted = await this.addressService.remove({ address_id: params.id });
    return {
      success: true,
      data: deleted,
      message: 'Address deleted successfully',
    };
  }

  @Get('validate-pincode/:pincode')
  @PublicApi()
  @ApiOperation({
    description:
      'Lookup city/state for a pincode via Delhivery serviceability API',
  })
  async validatePincode(
    @Param('pincode') pincode: string,
  ): Promise<ApiResponse> {
    const pin = String(pincode || '').trim();
    if (!/^\d{6}$/.test(pin)) {
      return {
        success: false,
        data: null,
        message: 'Invalid pincode',
      };
    }

    const result = await this.delhiveryService.checkPincodeServiceability(pin);

    if (result.status === 'unavailable') {
      return {
        success: false,
        data: null,
        message:
          'Temporarily unable to look up this pincode. Please enter city and state manually.',
      };
    }

    const city = result.district || result.city;
    const state = result.state;
    const hasLocation = Boolean(city || state);

    // Empty delivery_codes / unknown pin → not found in Delhivery
    if (!hasLocation && !result.prepaid && !result.cod) {
      return {
        success: false,
        data: null,
        message: 'Invalid pincode',
      };
    }

    return {
      success: true,
      data: {
        pincode: pin,
        isValid: true,
        city: city || null,
        state: state || null,
        district: result.district || null,
        state_code: result.stateCode || null,
        suggestions: {
          cities: city ? [city] : [],
          states: state ? [state] : [],
          districts: result.district ? [result.district] : [],
        },
      },
      message: 'Pincode validated successfully',
    };
  }
}
