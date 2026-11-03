FROM debian:bookworm-slim
WORKDIR /app

ARG TARGETARCH

RUN groupadd --system track && useradd --system --gid track track
COPY dist/track-linux-${TARGETARCH} /usr/local/bin/track
RUN chmod 755 /usr/local/bin/track && mkdir /data && chown track:track /data

ENV PORT=3000
ENV DB_PATH=/data/tracker.db
VOLUME ["/data"]

EXPOSE 3000
USER track
ENTRYPOINT ["/usr/local/bin/track"]
