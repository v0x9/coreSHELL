# Empty file for user implementation
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    coreutils \
    grep \
    findutils \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /coreSHell

COPY . .

ENTRYPOINT ["python3", "main.py"]



