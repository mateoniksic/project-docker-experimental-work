# Project Docker Experimental Work
## **How do you start the examples?**
- **Clone or download the project files**
- **Open the terminal inside "example" or "example\_with\_load\_balancer" directory and run the commands**
  - **Start command(*):** docker-compose up -d --build
    - **“example” URL:** <http://localhost:3000/>
    - **"example\_with\_load\_balancer" URL:** <http://localhost:8080/> 
  - **Stop command:** docker-compose down

***(\*) run only a single example at a time***

## **How to run the benchmark?**

To run the benchmark I used the **ab - Apache HTTP server benchmarking tool**. 

**To install the ab test on Linux OS I used the following command:** 

- apt install apache2-utils

**To run the benchmark I used the following commands:**

- **"example":** ab -n 10000 -c 6 <http://localhost:3000/>

- **"example\_with\_load\_balancer":** ab -n 10000 -c 6 <http://localhost:8080/> 

_An alternative is to download XAMPP and use the ab test tool that comes with it. To download the tool visit_  [_XAMPP Download_](https://www.apachefriends.org/download.html)_. Once installed, run the application, open the command line, and run the benchmark._

## **Benchmark report**

### **What did I test?**

My goal was to test load balancer vs head of line blocking. In other words, response time with n servers vs one if a small percent of requests are very slow.

Load balancing is a method designed to distribute incoming network traffic across multiple servers to ensure optimal resource utilization and prevent overload on a single server. 

Head-of-line blocking occurs if there is a single queue of data packets waiting to be transmitted, and the packet at the head of the queue (line) cannot move forward due to congestion, even if other packets behind this one could.

Load balancing enhances system scalability, availability, and reliability by mitigating the risk of a single point of failure. It optimizes resource utilization, leading to improved performance and responsiveness.

While load balancing offers numerous advantages, potential drawbacks include increased complexity in setup and maintenance as well as potential challenges in handling stateful applications like state sharing, session persistence, caching, etc...

### **Image of the system architecture**

![system](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/a3f3e30b-97b9-4b01-af0b-f46933535466)

### **How did I test it?**

For testing purposes, I have created two project variations — one project with a single Node.js server and one project with a load balancer that distributes the traffic among three Node.js servers.

In the "example" folder, you'll find the Docker configuration for a standalone Node.js server application. 

The "example\_with\_load\_balancer" folder includes a configuration with a load balancer for three identical Node.js server applications.

To simulate processing time, I utilized a for loop encapsulated within a function named "blocking”, and for head-of-line blocking, I implemented another function named "headOfLineBlocking" which incorporates a promise with a “setTimeout” function set to a 500ms delay before execution. By using the condition “Math.random() <= 0.1” the execution of the “headOfLineBlocking” function is triggered in 10% of requests.

```js
function blocking() {
  for (let i = 0; i < 100000000; i++) {}
}

async function headOfLineBlocking() {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

// INDEX VIEW
APP.get('', async (req, res) => {
  const processingStartTime = process.hrtime();

  // DEFAULT BLOCKING
  blocking();

  // HEAD OF LINE BLOCKING, 10% OF TIME
  if (Math.random() <= 0.1) {
    await headOfLineBlocking();
  }

  const processingEndTime = process.hrtime(processingStartTime);
  const processingTime = processingEndTime[0] * 1000 + processingEndTime[1] / 1e6;

  // CONTEXT
  res.render('index', {
    port: SERVER_PORT,
    theme: THEME,
    processingTime: processingTime,
  });
});
```

### **Why and how did I measure response times?**

I measured response times to assess the server's feedback speed under different conditions, specifically comparing scenarios with multiple concurrent requests and head-of-line blocking using a single server versus employing a load balancer with multiple servers. In the project variant with a single server and six concurrent requests, response times are expected to be higher due to potential delays caused by synchronous task processing. Conversely, in the load balancer configuration with three servers, the workload is distributed, minimizing the impact of head-of-line blocking.

To measure response times, I utilized the Apache HTTP server benchmarking tool (ab) and conducted tests with 10,000 requests and 6 concurrent requests. The reason I chose 6 concurrent requests is because it was the best way to demonstrate the effectiveness of a single server versus three servers. If concurrent requests are set to 1,000 then in both cases response time will be slow because 3 servers are not optimized to handle that kind of load. This way 90% of requests should have a response rate that is less than 50ms and 10% of requests will have a response time greater than 500ms.

Some of the key metrics and statistics that ab tool calculates and reports include:
- Requests per second (RPS): The rate at which requests are handled by the server per second.
- Time per request: The average time taken to complete a single request.
- Concurrency: The level of concurrency, or the number of multiple requests being processed simultaneously.
- Connection Times: Breakdown of time spent in different phases such as connecting, processing, and waiting.
- Transfer rate: The amount of data transferred per unit of time.
- Percentage of requests served within a certain time: Indicates the distribution of response times, helping you understand how many requests were served within specific time intervals.

#### Results: Single server - "example" - 10,000 requests - 6 concurrent requests
![ab-test-n-1000-c-6-single-server](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/0f1d65f9-e2ee-48f0-a48b-9e7d41b4367a)

#### Results: Load balancer with three servers - "example_with_load_balancer" - 10,000 requests - 6 concurrent requests
![ab-test-n-1000-c-6-load-balancer](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/45322bd1-bc07-41e5-8465-59cc0c4051af)



