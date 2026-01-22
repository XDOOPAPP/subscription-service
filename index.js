const app = require("./src/app");
const connectDB = require("./src/config/database");
const env = require("./src/config/env");
const EventBus = require("./src/infra/event-bus/event-bus");
const subscriptionRoutes = require("./src/routes/subscription.route");
const SubscriptionService = require("./src/services/subscription.service");
const seedFreePlan = require("./src/utils/seedFreePlan");

(async () => {
  // 1. connect database
  await connectDB();

  // 2. seed free plan
  await seedFreePlan();

  // 3. connect event bus
  const bus = new EventBus(env.rabbitMQ_url);
  await bus.connect();

  // 4. inject bus for app
  app.set("eventBus", bus);

  //--- IGNORE ---

  // init subscription service
  const subscriptionService = new SubscriptionService(bus);

  // check expired subscriptions
  setInterval(() => {
    subscriptionService._checkExpiredSubscriptions()
      .catch(err => console.error("Error checking expired subscriptions:", err));
  }, 1000 * 60 * 5); // every 5 minutes

  // 5. user route
  app.use("/api/v1/subscriptions", subscriptionRoutes(app));

  // 6. start server
  app.listen(env.port, () => {
    console.log(`Subscription Service running on port ${env.port}`);
  });
})();
