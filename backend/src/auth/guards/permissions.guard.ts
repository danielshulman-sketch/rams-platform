import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Permissions = (...permissions: string[]) => {
    return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
        Reflect.defineMetadata('permissions', permissions, descriptor ? descriptor.value : target);
        return descriptor;
    };
};

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.get<string[]>(
            'permissions',
            context.getHandler(),
        );

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.permissions) {
            return false;
        }

        return requiredPermissions.some((permission) =>
            user.permissions.includes(permission),
        );
    }
}
