# 42 OAuth Express App

Minimal express setup to play with 42 api

## Features

- **OAuth Authentication:** Securely authenticate users with 42's OAuth service.
- **Token Information Display:** Show the current access token's scope and expiration.
- **Data Fetching:** Retrieve and display data from the 42 API, such as user projects and personal information.
- **CSV Generation:** Create and download a CSV file with user project details.

## Installation and Setup

### Prerequisites

- Node.js installed on your system.
- A registered application on 42's API platform to obtain your Client ID and Client Secret.

### Steps

1. **Clone the Repository**

   Start by cloning this repository to your local machine.

    ```bash
    git clone https://github.com/Tonio2/api42
    ```

2. **Install Dependencies**

    Navigate into the project directory and install the required dependencies.

    ```bash
    cd api42
    npm install
    ```

3. **Configure Environment**

    Create a `.env` file in the root of your project or export the necessary environment variables for your application's Client ID and Client Secret.

    Example `.env` file:

    ```
    CLIENT_ID=u-s4t2ud-b24072f6afb777bb78c3e97cdfd19f565829d7b4404796e38580846cdcef75b
    CLIENT_SECRET=s-s4t2ud-1cc1bf552dd7edd86d7665687b0ddc3f6253034eba311eac767fd2954cd0444
    ```

    **Note:** Replace the values with your actual Client ID and Client Secret.

4. **Run the Application**

    You can start the application by running:

    ```bash
    node app.js
    ```

    This will start the server on `http://localhost:3000`. Navigate to this URL in your web browser to start using the app.

### Usage

- Visit `http://localhost:3000` to access the application.
- You will be prompted to log in via 42 OAuth if you haven't authenticated yet.
- After authentication, you can access the various endpoints defined in the application to fetch data from the 42 API or generate a CSV file.

## Contributing

Feel free to fork the repository and submit pull requests with any enhancements or fixes.

## License

This project is open-sourced under the MIT License.
