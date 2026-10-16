FROM ruby:3.3-slim

RUN apt-get update -qq \
  && apt-get install -y --no-install-recommends build-essential default-libmysqlclient-dev pkg-config git curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Production builds pass BUNDLE_WITHOUT=development:test
ARG BUNDLE_WITHOUT=""
ENV BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT=${BUNDLE_WITHOUT}

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

COPY bin/docker-entrypoint /usr/bin/docker-entrypoint
RUN chmod +x /usr/bin/docker-entrypoint
ENTRYPOINT ["docker-entrypoint"]

EXPOSE 3000
CMD ["bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
