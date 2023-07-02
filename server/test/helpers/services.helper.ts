import { AuthService } from "../../src/services/auth.service";
import { ProjectService } from "../../src/services/project.service";
import { RequestService } from "../../src/services/request.service";
import { UserService } from "../../src/services/user.service";
import { ValidationService } from "../../src/services/validation.service";

export const fakeUserService = {
  create() { return undefined; },
  findById() { return undefined; },
  findByEmail() { return undefined; },
  update() { return undefined; },
  destroy() { return undefined; },
} as unknown as UserService;

export const fakeProjectService = {
  create() { return undefined; },
  findById() { return undefined; },
} as unknown as ProjectService;

export const fakeRequestService = {
  create() { return undefined; },
  findByClientIdAndCode() { return undefined; },
  findByToken() { return undefined; },
  token() { return undefined; },
} as unknown as RequestService;

export const fakeAuthService = {
  login() { return undefined; },
  verify() { return undefined; },
} as unknown as AuthService;

export const fakeValidationService = {
  validate() { return undefined; },
} as unknown as ValidationService;
