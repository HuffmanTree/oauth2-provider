import { AuthService } from "../../services/auth.service.js";
import { ProjectService } from "../../services/project.service.js";
import { RequestService } from "../../services/request.service.js";
import { UserService } from "../../services/user.service.js";
import { ValidationService } from "../../services/validation.service.js";

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
