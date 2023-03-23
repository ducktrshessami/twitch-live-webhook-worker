import { DistinctQuestion } from "inquirer";

function validate(input: string): boolean {
    return !!input.trim();
}

const AuthorizationQuestions: Array<DistinctQuestion<AuthorizationAnswers>> = [
    {
        type: "input",
        name: "clientId",
        prefix: "",
        message: "Client ID:",
        validate
    },
    {
        type: "input",
        name: "clientSecret",
        prefix: "",
        message: "Client Secret:",
        validate
    }
];

const ConfirmationQuestion: DistinctQuestion<ConfirmationAnswers> = {
    type: "confirm",
    name: "confirm",
    prefix: "",
    message: "Authorize?"
};

export const SubscribeQuestions: Array<DistinctQuestion<SubscribeAnswers>> = (<Array<DistinctQuestion<any>>>AuthorizationQuestions).concat(
    {
        type: "input",
        name: "broadcasterName",
        prefix: "",
        message: "Channel Name:",
        validate
    },
    {
        type: "input",
        name: "callback",
        prefix: "",
        message: "Callback Endpoint:",
        validate
    },
    ConfirmationQuestion
);

type AuthorizationAnswers = {
    clientId: string;
    clientSecret: string;
};
type ConfirmationAnswers = { confirm: boolean };

type SubscribeAnswers = AuthorizationAnswers & ConfirmationAnswers & {
    broadcasterName: string;
    callback: string;
};
