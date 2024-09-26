# Video Editor

This is a queue-based video editor primarily used for video resizing by utilizing the FFmpeg Unix toolkit. I implemented this API server with `cpeak`, and it includes a static website in the public folder. For the database, I store the data as files in the data folder. While this is not an ideal approach, it is used here for simplicity to demonstrate the file resizing functionality with clustering mode.

## Default Login users

The application comes with a default user for testing purposes. You can use the following users to log in:

- **Username**: `quee`
- **Password**: `password`

Or you can view the exiting `users` in data folder

## Prerequisites

Before using this template, make sure you have the following toolkits installed:

1. **[FFmpeg](https://ffmpeg.org/)**: Required for video processing and media file manipulation.

   - Installation command:
     ```bash
     brew install ffmpeg
     ```

## Configuration

```plaintext
├── data/                        # Store the data like `video` for the information of the video
├── lib/                         # Helper function and utility tools
├── public/                      # Static website
├── src/
│   ├── controllers/             # route the traffic out
│   ├── middleware/              # Middleware for blocking unprotential requests
│   ├── cluster.js               # Basic cluster mode setup
│   └── DB.js                    # Basic database setup
├── storage/                     # For storing the videos
└── package.json
```

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run start
```

### Start development with clustering mode

```bash
npm run cluster
```
