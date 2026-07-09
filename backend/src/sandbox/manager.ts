// Empty file for user implementation
import Docker from "dockerode";

class SandboxManager {
    private docker: Docker;

    constructor() {
        this.docker = new Docker({
        socketPath: "/var/run/docker.sock",
    });
    }

    async createContainer() {
        const container = await this.docker.createContainer({
            Image: "coreshell",

            Tty: true,

            OpenStdin: true,

            AttachStdin: true,

            AttachStdout: true,

            AttachStderr: true,

            Cmd: ["python3", "main.py"],

        });
        await container.start();

        return container.id;
    }

    async attach(containerId: string) {

        const container = this.docker.getContainer(containerId);
        
        const stream = await container.attach({
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true,
        });


        return stream;
    }


    async stop(containerId: string) {
        const container = this.docker.getContainer(containerId);

        await container.stop();
    }

    async destroy(containerId: string) {
        const container = this.docker.getContainer(containerId);

        await container.remove({
            force: true,
        });

    }

    async inspect(containerId: string) {

        const container = this.docker.getContainer(containerId);

        return await container.inspect();

    }

    async resize(containerId: string, rows: number, cols: number) {
        const container = this.docker.getContainer(containerId);

        await container.resize({
            h: rows,
            w: cols,
        });
    }
}

export default SandboxManager;