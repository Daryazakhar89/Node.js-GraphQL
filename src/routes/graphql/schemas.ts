import { Type } from '@fastify/type-provider-typebox';
import { buildSchema } from 'graphql';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const graphQlSchema = buildSchema(`
  scalar UUID

  enum MemberTypeId {
    basic
    business
  }

  type User {
    id: UUID
    name: String
    balance: Float
    profile: Profile
    posts: [Post]
    userSubscribedTo: [User]
    subscribedToUser: [User]
  }

  type Profile {
    id: UUID
    isMale: Boolean
    yearOfBirth: Int
    userId: String
    memberType: MemberType
    memberTypeId: MemberTypeId
  }

  type Post {
    id: UUID
    title: String
    content: String
    authorId: String
  }

  type MemberType {
    id: MemberTypeId
    discount: Float
    postsLimitPerMonth: Int
    profiles: [Profile]
}

  type Query {
    users: [User]
    user(id: UUID): User
    memberTypes: [MemberType]
    memberType(id: MemberTypeId!): MemberType
    posts: [Post]
    post(id: UUID): Post
    profiles: [Profile]
    profile(id: UUID): Profile
  }
`);
