const fs = require("fs");
const accounts = require("./accounts.json");
const proxies = [];
const modules = require("./modules");
const config = require("./config.json");
const { IgApiClient } = require("instagram-private-api");

// pretty much done, just need to use try/catch for error handling since this api dumb asl LOL.

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
      await this.ig.simulate
        .preLoginFlow()
        .then((res) => {})
        .catch(async (err) => {
          console.log(err);
          if (err.response.status === 429) {
            console.log("Rate limited, changing proxy and waiting 60 secs");
            this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.proxy = `${this.formatProxy(this.rawProxy)}`;
            this.ig.state.proxyUrl = this.proxy;
            await modules.sleep(60 * 1000);
          } else if (err.response.status === 400) {
            console.log(
              "Got caught spamming, changing proxy and waiting 60 seconds"
            );
            this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.proxy = `${this.formatProxy(this.rawProxy)}`;
            this.ig.state.proxyUrl = this.proxy;
            await modules.sleep(60 * 1000);
          }
        });

      await this.ig.account
        .login(`${this.account.user}`, `${this.account.pass}`)
        .then((res) => {})
        .catch(async (err) => {
          console.log(err);
          if (err.response.status === 429) {
            console.log("Rate limited, changing proxy and waiting 60 secs");
            this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.proxy = `${this.formatProxy(this.rawProxy)}`;
            this.ig.state.proxyUrl = this.proxy;
            await modules.sleep(60 * 1000);
          } else if (err.response.status === 400) {
            console.log(
              "Got caught spamming, changing proxy and waiting 60 seconds"
            );
            this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.proxy = `${this.formatProxy(this.rawProxy)}`;
            this.ig.state.proxyUrl = this.proxy;
            await modules.sleep(60 * 1000);
          }
        });
      console.log("You have successfully logged in.");

      process.nextTick(
        async () =>
          await this.ig.simulate
            .postLoginFlow()
            .then((res) => {
              console.log(res);
            })
            .catch(async (err) => {
              console.log(err.message);
              if (err.response.status === 429) {
                console.log("Rate limited, changing proxy and waiting 60 secs");
                this.rawProxy =
                  proxies[Math.floor(Math.random() * proxies.length)];
                this.proxy = `${this.formatProxy(this.rawProxy)}`;
                this.ig.state.proxyUrl = this.proxy;
                await modules.sleep(60 * 1000);
              } else if (err.response.status === 400) {
                console.log(
                  "Got caught spamming, changing proxy and waiting 60 seconds"
                );
                this.rawProxy =
                  proxies[Math.floor(Math.random() * proxies.length)];
                this.proxy = `${this.formatProxy(this.rawProxy)}`;
                this.ig.state.proxyUrl = this.proxy;
                await modules.sleep(60 * 1000);
              }
            })
      );

      // search tag
      await this.ig.feed
        .tags(config.tag, "top")
        .items()
        .then((res) => {
          this.feed.push(res);
        })
        .catch(async (err) => {
          console.log(err);
          if (err.response.status === 429) {
            console.log("Rate limited, changing proxy and waiting 60 secs");
            this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.proxy = `${this.formatProxy(this.rawProxy)}`;
            this.ig.state.proxyUrl = this.proxy;
            await modules.sleep(60 * 1000);
          } else if (err.response.status === 400) {
            console.log(
              "Got caught spamming, changing proxy and waiting 60 seconds"
            );
            this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.proxy = `${this.formatProxy(this.rawProxy)}`;
            this.ig.state.proxyUrl = this.proxy;
            await modules.sleep(60 * 1000);
          }
        });
    } catch (error) {
      console.log(error.message);
      process.exit();
    }
    return this.loopcomments();
  }
  async loopcomments() {
    // loop thru the whole feed and for each account comment evenly on different posts so theres no identical comments on each post.
    for (let i = this.id; i <= this.feed[0].length; i += accounts.length) {
      // fs.writeFile("test2.json", JSON.stringify(this.feed[0][i]), () => {});

      // fetch media id
      this.mediaid.push(this.feed[0][i - 1].pk);
      this.username = this.feed[0][i - 1].user.username;
      await this.ig.media
        .comment({
          mediaId: `${this.mediaid[i - 1]}`,
          text: config.comment,
        })
        .then(() => {
          console.log(`Commented on ${this.username}'s post.`);
        })
        .catch(async (err) => {
          // fix the goddamn fucking error handling with this api god damn
          console.log(err);
          if (err.response.status === 429) {
            console.log("Rate limited, changing proxy and waiting 60 secs");
            this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.proxy = `${this.formatProxy(this.rawProxy)}`;
            this.ig.state.proxyUrl = this.proxy;
            await modules.sleep(60 * 1000);
          } else if (err.response.status === 400) {
            console.log(
              "Got caught spamming, changing proxy and waiting 60 seconds"
            );
            this.rawProxy = proxies[Math.floor(Math.random() * proxies.length)];
            this.proxy = `${this.formatProxy(this.rawProxy)}`;
            this.ig.state.proxyUrl = this.proxy;
            await modules.sleep(60 * 1000);
          }
          await this.loopcomments();
        });

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
    console.log(
      "All comments have been delivered to specified hashtag. Thanks for using!"
    );
    process.exit();
  }
}

accounts.forEach((account, i) => {
  new Bot({ id: i + 1, account: account });
});
