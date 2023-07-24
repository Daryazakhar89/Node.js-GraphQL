import { Post, PrismaClient, Profile, User } from '@prisma/client';
import { UUIDType } from './types/uuid.js';
import { UUID } from 'crypto';

export const resolvers = {
  UUID: UUIDType,

  users(args, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.user.findMany({
      include: {
        posts: true,
        profile: {
          include: {
            memberType: true,
          },
        },
      },
    });
  },

  async user({ id }: { id: UUID }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,
        profile: {
          include: {
            memberType: true,
          },
        },
        userSubscribedTo: true,
      },
    });

    if (user === null) {
      return null;
    }

    const getUserSubscribedTo = async (id: UUID) => {
      return prisma.user.findMany({
        where: {
          subscribedToUser: {
            some: {
              subscriberId: id,
            },
          },
        },
      });
    };

    const getSubscribedToUser = async (id: UUID) => {
      return prisma.user.findMany({
        where: {
          userSubscribedTo: {
            some: {
              authorId: id,
            },
          },
        },
      });
    };

    const userSubscribedTo = await getUserSubscribedTo(id);
    const subscribedToUser = await getSubscribedToUser(id);

    const userSubscribedToSubscriptionPromises = userSubscribedTo.map((user) =>
      getUserSubscribedTo(user.id as UUID),
    );
    const userSubscribedToSubscription = await Promise.all(
      userSubscribedToSubscriptionPromises,
    );
    const userSubscribedToFollowersPromises = userSubscribedTo.map((user) =>
      getSubscribedToUser(user.id as UUID),
    );
    const userSubscribedToFollowers = await Promise.all(
      userSubscribedToFollowersPromises,
    );
    const userSubscribedToMapped = userSubscribedTo.map((user, index) => {
      return {
        ...user,
        userSubscribedTo: userSubscribedToSubscription[index],
        subscribedToUser: userSubscribedToFollowers[index],
      };
    });

    const subscribedToUserSubscriptionPromises = subscribedToUser.map((user) =>
      getUserSubscribedTo(user.id as UUID),
    );
    const subscribedToUserSubscription = await Promise.all(
      subscribedToUserSubscriptionPromises,
    );
    const subscribedToUserFollowersPromises = subscribedToUser.map((user) =>
      getSubscribedToUser(user.id as UUID),
    );
    const subscribedToUserFollowers = await Promise.all(
      subscribedToUserFollowersPromises,
    );
    const subscribedToUserMapped = subscribedToUser.map((user, index) => {
      return {
        ...user,
        userSubscribedTo: subscribedToUserSubscription[index],
        subscribedToUser: subscribedToUserFollowers[index],
      };
    });

    return {
      ...user,
      userSubscribedTo: userSubscribedToMapped,
      subscribedToUser: subscribedToUserMapped,
    };
  },

  memberTypes(args, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.memberType.findMany();
  },

  memberType({ id }: { id: string }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    const memberType = prisma.memberType.findUnique({
      where: {
        id,
      },
    });

    return memberType;
  },

  posts(args, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.post.findMany();
  },

  post({ id }: { id: UUID }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    const post = prisma.post.findUnique({
      where: {
        id,
      },
    });

    return post;
  },

  profiles(args, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.profile.findMany();
  },

  profile({ id }: { id: UUID }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    const profile = prisma.profile.findUnique({
      where: {
        id,
      },
    });

    return profile;
  },

  createProfile({ dto }: { dto: Profile }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.profile.create({
      data: dto,
    });
  },

  createUser({ dto }: { dto: User }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.user.create({
      data: dto,
    });
  },

  createPost({ dto }: { dto: Post }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.post.create({
      data: dto,
    });
  },

  async deletePost({ id }: { id: UUID }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    await prisma.post.delete({
      where: { id },
    });
  },

  async deleteUser({ id }: { id: UUID }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    await prisma.user.delete({
      where: { id },
    });
  },

  async deleteProfile({ id }: { id: UUID }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    await prisma.profile.delete({
      where: { id },
    });
  },

  changePost({ id, dto }: { id: UUID, dto: Post }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.post.update({
      where: { id },
      data: dto,
    });
  },

  changeUser({ id, dto }: { id: UUID, dto: User }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.user.update({
      where: { id },
      data: dto,
    });
  },

  changeProfile({ id, dto }: { id: UUID, dto: Profile }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    return prisma.profile.update({
      where: { id },
      data: dto,
    });
  },

  subscribeTo({ userId, authorId }: { userId: UUID, authorId: UUID }, contextValue: { prisma: PrismaClient }) {
    return contextValue.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        userSubscribedTo: {
          create: {
            authorId: authorId,
          },
        },
      },
    });
  },

  async unsubscribeFrom({ userId, authorId }: { userId: UUID, authorId: UUID }, contextValue: { prisma: PrismaClient }) {
    const prisma = contextValue.prisma;

    await prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: userId,
          authorId: authorId,
        },
      },
    });
  },
};
