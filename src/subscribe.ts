import inquirer from "inquirer";
import { SubscribeQuestions } from "./cli";
import { authorize, getUsers, subscribe } from "./twitch";

const input = await inquirer.prompt(SubscribeQuestions);
if (!input.confirm) {
    console.log("Cancelled");
    process.exit();
}

await authorize(input.clientId, input.clientSecret, async token => {
    const users = await getUsers(token, { logins: [input.broadcasterName] });
    if (
        users.data.length &&
        await subscribe(
            token,
            users.data[0].id,
            input.callback,
            input.clientSecret
        )
    ) {
        console.log(`Subscribed callback "${input.callback}" to user "${input.broadcasterName}" (ID: ${users.data[0].id})`);
    }
    else {
        console.log(`Unable to find user: ${input.broadcasterName}`);
    }
});
