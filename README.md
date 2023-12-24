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

Load balancers can benefit a wide range of applications, particularly those that experience varying levels of traffic and demand. Some types of applications that can benefit from load balancers include: web applications, highly available services, API gateways, media streaming services, and IoT platforms.

### **Image of the system architecture**
Example with load balancer includes:
- Docker setup
  - 3 Applications (NodeJS/ExpressJS/EJS)
  - 1 Load Balancer (Nginx)

Example without load balancer includes:
- 1 Application (NodeJS/ExpressJS/EJS)

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

### **Benchmark results**
#### Benchmark - Single server - "example" - 10,000 requests - 6 concurrent requests
![ab-test-n-1000-c-6-single-server](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/0f1d65f9-e2ee-48f0-a48b-9e7d41b4367a)

#### Benchmark - Load balancer with three servers - "example_with_load_balancer" - 10,000 requests - 6 concurrent requests
![ab-test-n-1000-c-6-load-balancer](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/45322bd1-bc07-41e5-8465-59cc0c4051af)

### **Plots**
##### Comparison of response times
![image](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/d5ea851d-9872-4a00-8ad8-b4e0972834b5)

\* lower is better

##### Comparison of requests per second
![image](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/f1337def-9894-45e4-8819-25658900542b)

\* higher is better

##### Comparison of failure rates
![image](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/fd022687-76b7-4c07-a9e0-4d277809a2e1)

\* lower is better

##### Comparison of median connection time
![image](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/3527ae78-efa8-418a-89cc-41632228cd4c)

\* lower is better

##### Comparison of max connection time
![image](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/03eed0dc-918c-4c7d-b7fb-8ff58595dccb)

\* lower is better

##### Comparison of mean time per request
![image](https://github.com/mateoniksic/project-docker-experimental-work/assets/57192709/874f58cd-1afb-49de-8d34-9ae924e350f5)

\* lower is better

### **Conclusion**
The benchmark results indicate that the single server and the load balancer with three servers exhibit different performance characteristics under the tested conditions. For the single server configuration, the requests per second (RPS) value is approximately 43.20, with a mean time per request of 138.889 milliseconds. However, a substantial number of requests (93.95%) failed, leading to a less efficient performance.

**Single server:**
- 50% of requests were served within 90 ms.
- 66% within 111 ms.
- 75% within 116 ms.
- 80% within 132 ms.
- 90% within 530 ms.
- 95% within 591 ms.
- 98% within 619 ms.
- 99% within 634 ms.
- 100% within 735 ms (longest request).

**Load balancer with three servers:**
- 50% of requests were served within 24 ms.
- 66% within 26 ms.
- 75% within 37 ms.
- 80% within 45 ms.
- 90% within 522 ms.
- 95% within 530 ms.
- 98% within 545 ms.
- 99% within 559 ms.
- 100% within 645 ms (longest request).

Comparing the two configurations, the load balancer with three servers consistently demonstrates faster response times across all percentiles. The load balancer's ability to distribute requests efficiently among multiple servers contributes to reduced response times compared to a single server.

On the other hand, the load balancer with three servers demonstrates a higher RPS of 72.83, with a lower mean time per request of 82.378 milliseconds. The failure rate is also lower at 19.33%. The longest request for a load balancer configuration is 645ms compared to a single server which is 735ms. These results suggest that the load balancer configuration outperforms the single server setup, distributing the load more effectively and handling a greater number of requests.
