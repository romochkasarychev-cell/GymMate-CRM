export const testUser  = {
email:'demo@gymmate.local',
password:'demo123'
};

export function createRegisterUser() {
    return {
    email: `newUser_${Date.now()}@mail.ru`,
    password: '123456',
    name: 'new',
    surname: 'user'
};
};