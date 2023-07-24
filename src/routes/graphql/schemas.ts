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
    user(id: UUID!): User
    memberTypes: [MemberType]
    memberType(id: MemberTypeId!): MemberType
    posts: [Post]
    post(id: UUID!): Post
    profiles: [Profile]
    profile(id: UUID!): Profile
  }

  input CreateUserInput {
    name: String
    balance: Float
  }

  input CreateProfileInput {
    isMale: Boolean
    yearOfBirth: Int
    userId: String
    memberTypeId: MemberTypeId
  }

  input CreatePostInput {
    title: String
    content: String
    authorId: String
  }

  input ChangeUserInput {
    name: String
    balance: Float
  }

  input ChangeProfileInput {
    isMale: Boolean
    yearOfBirth: Int
    memberTypeId: MemberTypeId
  }

  input ChangePostInput {
    title: String
    content: String
  }

  type Mutation {
    createProfile(dto: CreateProfileInput): Profile
    createUser(dto: CreateUserInput): User
    createPost(dto: CreatePostInput): Post
    deleteProfile(id: UUID!): Boolean
    deleteUser(id: UUID!): Boolean
    deletePost(id: UUID!): Boolean
    changeProfile(id: UUID!, dto: ChangeProfileInput): Profile
    changeUser(id: UUID!, dto: ChangeUserInput): User
    changePost(id: UUID!, dto: ChangePostInput): Post
    subscribeTo(userId: UUID!, authorId: UUID!): User
    unsubscribeFrom(userId: UUID!, authorId: UUID!): Boolean
  }
`);
