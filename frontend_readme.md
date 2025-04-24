## Frontend (Angular) 

FYI: 

  ```
  Backend Repo URL : https://github.com/snaveenkpndevops/Mean_Stack_Todo_App_Backend
  ```

Reference from geeks for geeks : https://www.geeksforgeeks.org/todo-list-application-using-mean-stack/

MEAN STACK  --> Mongo Express Angular Node.js

## Installation of Angular packages and and code (Also Running the application in Local machine)

1. npm install -g @angular/cli  -->  Run the following command to install Angular CLI globally

2. ng new frontend    -->    Create Angular App named frontend   --> cd  frontend

3. npm install -D tailwindcss postcss autoprefixer   -->  Install talwind CSS

4. npx tailwindcss init  -->  Install talwind CSS

5.  Configure your tailwind.config.js file.

   ```

   /** @type {import('tailwindcss').Config} */
   module.exports = {
   content: [
      "./src/**/*.{html,ts}",
   ],
   theme: {
      extend: {},
   },
   plugins: [],
   }

   ```

6. Add the Tailwind directives to your CSS.

   ```
   Add the @tailwind directives in your ./src/styles.css file.

   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   ```

7. ng g s webrequest   -->  Run the below command to make Angular service webrequest

8. ng g c MyComponents/todo-add   -->   Run the below command to create TodoAdd component

9. Important Configurations in `app.config.ts` file:

   ```

   // src/app/app.config.ts:

   import { ApplicationConfig } from '@angular/core';
   import { provideRouter } from '@angular/router';

   import { routes } from './app.routes';
   import { provideClientHydration } from '@angular/platform-browser';
   import { provideHttpClient, withFetch } from '@angular/common/http';

   export const appConfig: ApplicationConfig = {
         providers: [provideRouter(routes), provideClientHydration(),provideHttpClient(withFetch())]
   };

   ```

3. paste all the code (refer geeks for geeks documents)

   ### Reference from geeks for geeks : https://www.geeksforgeeks.org/todo-list-application-using-mean-stack/

4. ng serve  (or)  ng serve --open --> Start the Angular App using the following command.

5. our frontend is running in `http://localhost:4200`

6. In frontend inside `webrequest.service.ts` we configured the backend ip and port inside getRestaurants().
      Backend is running in port 3001.

      ```
      // src/app/service/webrequest.service.ts:

      import { HttpClient } from '@angular/common/http';
      import { Injectable } from '@angular/core';

      @Injectable({
         providedIn: 'root'
      })
      export class WebrequestService {
         readonly Root_URL;
         constructor(private http: HttpClient) {
            this.Root_URL = "http://localhost:3001/";
            //this.Root_URL = "http://backend-service.todo.svc.cluster.local:3001/";
            //this.Root_URL = "http://adf2479f8ccd345bab71a60579c127eb-1366346907.ap-south-1.elb.amazonaws.com/";
         }

         get(uri: string) {
            return this.http.get(this.Root_URL + uri);
         }

         post(uri: string, payload: object) {
            return this.http.post(this.Root_URL + uri, payload)
         }

         delete(uri: string, payload: object) {
            console.log(uri);
            console.log(this.Root_URL + uri);
            return this.http.delete(this.Root_URL + uri)
         }

         put(uri: string, payload: object) {
            return this.http.put(this.Root_URL + uri, payload)
         }
      }
      ```

7. For kubernetes environment, we need to change the backend url for connection.

   * In `webrequest.service.ts` update the backend url based on kubernetes backend service name. For example, if your backend service is called `backend-service`, you can update the API URL in webrequest.service.ts as follows:

   ```
      // Change the apiUrl to the internal DNS if the frontend is inside the same Kubernetes cluster
      this.Root_URL = "http://backend-service.todo.svc.cluster.local:3001/"
   ```

When you build the Angular application, it will use the correct environment file based on the build configuration. For example:

`ng build --prod    // This will use environment.prod.ts`

`ng build           // This will use environment.ts`


### Note:

      1. We are using angular default port 4200 to access our frontend. To change the port we need to edit `angular.json` file.
      2. In angular we need to use environment.ts and environment.prod.ts  file. Angular doesn't provide runtime environment variables directly.

8. if we want to customize our nginx port -->  create nginx.conf file and modify the port to 4200 and update the dockerfile.


## Note:

## Creating Kubernetes pods for the frontend application:

### Prerequisite for Testing:

1. make sure your docker-desktop application is running.
2. minikube start   -->  Run this command to start minikube cluster.
3. make sure to login docker in order to push the docker image to docker hub.
 
    `docker commands:`

    ```
    docker login        // login to dockerhub

    docker tag todo-backend:1 snaveenkpn/todo-backend:1    // tag your docker image in order to push the image to dockerhub

    docker push snaveenkpn/todo-backend:1      // push tagged docker image to docker hub

    ```

You can either use minikube cluster (or) Kind cluster.

3. minikube status
4. kubectl get nodes

### Note:

For kubernetes deployment it is good to use minikube for testing. But the real problem is we will face connection issue  between frontend and backend. Eventhough we pass the backend url correctly to frontend code it still will not connect. So to avoid this problem we need to create a ingress for frontend and backend and then in frontend code we pass the `backend ingress host along with path URL as a api url.` Now both frontend and backend will get connected.

## Steps to deploy our code in eks/aks cluster:

Before Deploying the frontend yaml, deploy the backend and mongo db yaml. Check `Backend Repo URL : https://github.com/snaveenkpndevops/Mean_Stack_Todo_App_Backend`

1. Create a Eks Public Cluster.
2. Create a Node Group with spot instance inorder to reduce eks cost.
3. SG --> Allow All Traffic
4. Once Eks cluster and node group created.
5. Open VS CODE terminal  -->  Execute the below commands.

        * aws configure
        * aws eks update-kubeconfig --region ap-south-1 --name mean-stack-eks 
        * kubectl config current-context 
        * helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
        * helm repo update
        * helm repo add jetstack https://charts.jetstack.io
        * helm repo update
        * helm install ingress-nginx ingress-nginx/ingress-nginx  --create-namespace --namespace ingress-basic --version 4.5.2     
        * helm repo update
        * kubectl create ns todo

6. The Installation of ingress-nginx will create a `Classic Load balancer` in aws. Copy the load balancer DNS.
7. Create a `Ingress.yaml`  

   ```
   // ingress.yaml

   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
   name: ingress-todo
   namespace: todo
   annotations:
      nginx.ingress.kubernetes.io/enable-cors: "true"
      nginx.ingress.kubernetes.io/cors-allow-headers: "*"
      nginx.ingress.kubernetes.io/cors-allow-methods: "*"
      nginx.ingress.kubernetes.io/cors-allow-origin: "*"
      kubernetes.io/ingress.class: nginx
      #nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
   ingressClassName: nginx
   rules:
      - host: adf2479f8ccd345bab71a60579c127eb-1366346907.ap-south-1.elb.amazonaws.com
         http:
         paths:
            # Path for frontend
            - path: / # Matches all URLs starting with /
               pathType: Prefix
               backend:
               service:
                  name: frontend-service
                  port:
                     number: 4200
            
            # Path for backend
            - path: /tasks # Matches all URLs starting with /backend
               pathType: Prefix
               backend:
               service:
                  name: backend-service
                  port:
                     number: 3001

   ```
8. Kubectl apply -f e:\MyHandsonProjects\CICD_Projects\Frontend_backend\mean_stack_simple_todo_app\Kubernetes\ingress.yaml -n todo

9. In frontend `webrequest.service.ts` file we need to change the this.Root_URL.

   ```
   // src/app/service/webrequest.service.ts:

   import { HttpClient } from '@angular/common/http';
   import { Injectable } from '@angular/core';

   @Injectable({
      providedIn: 'root'
   })
   export class WebrequestService {
      readonly Root_URL;
      constructor(private http: HttpClient) {
         //this.Root_URL = "http://localhost:3001/";
         //this.Root_URL = "http://backend-service.todo.svc.cluster.local:3001/";
         this.Root_URL = "http://adf2479f8ccd345bab71a60579c127eb-1366346907.ap-south-1.elb.amazonaws.com/";
      }

      get(uri: string) {
         return this.http.get(this.Root_URL + uri);
      }

      post(uri: string, payload: object) {
         return this.http.post(this.Root_URL + uri, payload)
      }

      delete(uri: string, payload: object) {
         console.log(uri);
         console.log(this.Root_URL + uri);
         return this.http.delete(this.Root_URL + uri)
      }

      put(uri: string, payload: object) {
         return this.http.put(this.Root_URL + uri, payload)
      }
   }
     
   ```

10. docker build -t todo-frontend:1 .
11. docker tag todo-frontend:1 snaveenkpn/todo-frontend:1
12. docker push snaveenkpn/todo-frontend:1
13. kubectl apply -f e:\MyHandsonProjects\CICD_Projects\Frontend_backend\mean_stack_simple_todo_app\Kubernetes\frontend.yaml -n todo

   ```
   // frontend.yaml

   apiVersion: apps/v1
   kind: Deployment
   metadata:
   name: frontend
   namespace: todo  # Specify the namespace if needed
   spec:
   replicas: 1  # Adjust based on your desired replica count
   selector:
      matchLabels:
         app: frontend
   template:
      metadata:
         labels:
         app: frontend
      spec:
         containers:
         - name: frontend
         image: snaveenkpn/todo-frontend:8 # Replace with your frontend image
         ports:
         - containerPort: 80  # Expose the frontend port

   ---
   apiVersion: v1
   kind: Service
   metadata:
   name: frontend-service
   namespace: todo  # Specify the namespace if needed
   spec:
   selector:
      app: frontend
   ports:
   - protocol: TCP
      port: 4200  # Port exposed for frontend access
      targetPort: 80  # Port inside the container
   type: ClusterIP  # Can be NodePort or ClusterIP or LoadBalancer depending on your needs


   ```

### Images:

![Frontend Logo](./images/Ingress%20frontend1.png)

![Frontend Logo](./images/Ingress%20backend1.png)