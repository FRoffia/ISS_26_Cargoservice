# syntax=docker/dockerfile:1

# ---------- Stage 1: build ----------
FROM gradle:8.10-jdk17 AS build
WORKDIR /workspace

# 1. dipendenze locali (flatDir) — mantieni il path relativo '../unibolibs'
COPY unibolibs ./unibolibs

# 2. file di build separati per sfruttare la cache dei layer Docker
WORKDIR /workspace/devices
COPY devices/build.gradle devices/settings.gradle ./
COPY devices/gradle ./gradle
COPY devices/gradlew ./
RUN chmod +x gradlew

# 3. resto del sorgente (src, utils, .pl, ecc.)
COPY devices/ .

# 4. build della distribuzione (skip test per velocità in CI/CD; togli -x test se vuoi farli girare)
RUN ./gradlew installDist --no-daemon -x test

# ---------- Stage 2: runtime (leggero, ARM-compatibile) ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/devices/build/install/devices .

# Flag JVM pensati per Raspberry Pi 3 (1 GB RAM totale)
ENV JAVA_OPTS="-Xmx256m -Xss512k -XX:+UseSerialGC"

ENTRYPOINT ["sh", "-c", "./bin/devices $JAVA_OPTS"]