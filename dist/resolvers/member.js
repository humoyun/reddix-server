"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Member_1 = require("../entities/Member");
const argon2_1 = __importDefault(require("argon2"));
let UserInput = class UserInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserInput.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserInput.prototype, "password", void 0);
UserInput = __decorate([
    type_graphql_1.InputType()
], UserInput);
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => Member_1.Member, { nullable: true }),
    __metadata("design:type", Member_1.Member)
], UserResponse.prototype, "member", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let MemberResolver = class MemberResolver {
    register(args, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args.username || args.username.length < 2) {
                return {
                    errors: [{
                            field: "username",
                            message: "length should be greater than 2",
                        }]
                };
            }
            if (!args.password || args.password.length < 4) {
                return {
                    errors: [{
                            field: "password",
                            message: "length should be greater than 4",
                        }]
                };
            }
            const hashedPsw = yield argon2_1.default.hash(args.password);
            const member = ctx.db.create(Member_1.Member, {
                username: args.username,
                email: args.email,
                password: hashedPsw
            });
            try {
                yield ctx.db.persistAndFlush(member);
            }
            catch (err) {
                console.error(err);
            }
            return { member };
        });
    }
    login(args, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield ctx.db.findOne(Member_1.Member, { username: args.username });
            const errors = {
                field: "username",
                message: "this username doesn't exist"
            };
            if (!member) {
                return {
                    errors: [errors]
                };
            }
            const isCorrect = yield argon2_1.default.verify(member.password, args.password);
            if (!isCorrect) {
                return {
                    errors: [errors]
                };
            }
            return {
                member
            };
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("args")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserInput, Object]),
    __metadata("design:returntype", Promise)
], MemberResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("args")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserInput, Object]),
    __metadata("design:returntype", Promise)
], MemberResolver.prototype, "login", null);
MemberResolver = __decorate([
    type_graphql_1.Resolver()
], MemberResolver);
exports.MemberResolver = MemberResolver;
//# sourceMappingURL=member.js.map