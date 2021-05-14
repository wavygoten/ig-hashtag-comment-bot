const fs = require("fs");
const accounts = require("./accounts.json");
const proxies = [];
const modules = require("./modules");
const config = require("./config.json");
const { IgApiClient } = require("instagram-private-api");

// pretty much done, just need to use try/catch for error handling since this api dumb asl LOL.

// fix the goddamn fucking error handling with this api god damn

// https://www.instagram.com/explore/tags/<tag>/?__a=1

fs.readFileSync(__dirname + "/proxies.txt", "utf-8")
  .split(/\r?\n/)
  .forEach((line) => proxies.push(line));

class Bot {
  constructor(props) {
    this.account = props.account;
    this.id = props.id;
    this.mediaid = [];
    this.username;
    this.feed = [];
    this.randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
    this.proxy = `${modules.formatProxy(this.randomProxy)}`;
    this.ig = new IgApiClient();

    this.comments = [];
    console.log(`Using the account - ${this.account.user}`);
    if (this.proxy === "null") {
      console.error(
        `You have no proxies, bot will use localhost. Don't worry if you don't know what this is :)`
      );
      this.proxy = ``;
    }
    this.genDevice();
  }

  async genDevice() {
    try {
      // logging in
      this.ig.state.generateDevice(`${this.account.user}`);
      this.ig.state.proxyUrl = this.proxy;
      await this.ig.simulate.preLoginFlow();

      await this.ig.account.login(
        `${this.account.user}`,
        `${this.account.pass}`
      );

      console.log("You have successfully logged in.");

      process.nextTick(async () => await this.ig.simulate.postLoginFlow());

      // search tag
      await this.ig.feed
        .tags(config.tag, "recent")
        .items()
        .then((res) => {
          this.feed.push(res);
        })
        .catch(async (err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error.message);
      if (
        error.message ===
        `POST /api/v1/accounts/login/ - 400 Bad Request; Please wait a few minutes before you try again.`
      ) {
        console.log(
          "Got caught spamming, changing proxy and waiting 60 seconds"
        );
        this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
        this.proxy = `${modules.formatProxy(this.rawProxy)}`;
        this.ig.state.proxyUrl = this.proxy;
        await modules.sleep(60 * 1000);
        await this.genDevice();
      }
      // process.exit();
    }
    return this.loopcomments();
  }
  async loopcomments() {
    try {
      // loop thru the whole feed and for each account comment evenly on different posts so theres no identical comments on each post.
      for (let i = this.id; i <= this.feed[0].length; i += accounts.length) {
        // fs.writeFile("test2.json", JSON.stringify(this.feed[0][i]), () => {});
        this.mediaid.push(this.feed[0][i - 1].pk);
        this.username = this.feed[0][i - 1].user.username;
        await this.ig.media
          .comment({
            mediaId: `${this.mediaid[i - 1]}`,
            text: config.comment,
          })
          .then(async () => {
            console.log(`Commented on ${this.username}'s post.`);
            await modules.sleep(60000);
          })
          .catch((err) => {
            console.log(err);
          });

        // fetch media id

        // get user stuff if needed.
        // await this.ig.user
        //   .search(`${this.username}`)
        //   .then((res) => {
        //     console.log(res);
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
      }
    } catch (error) {
      console.log(error.message);
      if (
        error.message ===
        `POST /api/v1/accounts/login/ - 400 Bad Request; Please wait a few minutes before you try again.`
      ) {
        console.log(
          "Got caught spamming, changing proxy and waiting 60 minutes"
        );
        this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
        this.proxy = `${modules.formatProxy(this.rawProxy)}`;
        this.ig.state.proxyUrl = this.proxy;
        await modules.sleep(60000 * 60);
        await this.genDevice();
      }
    }
    console.log(
      "All comments have been delivered to specified hashtag. Thanks for using!"
    );
    process.exit();
  }
}

accounts.forEach((account, i) => {
  new Bot({ id: i + 1, account: account });
});
