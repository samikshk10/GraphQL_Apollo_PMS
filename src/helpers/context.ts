export const context = ({ req }: { req: any }) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return Promise.resolve({});
    }
    return Promise.resolve({ token });
  } catch (error: any) {
    throw new Error(error.message);
  }
};
