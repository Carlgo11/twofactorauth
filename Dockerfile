FROM jekyll/builder
COPY . /srv/jekyll
WORKDIR /srv/jekyll
RUN ls -la /srv/jekyll
#RUN /srv/jekyll/scripts/create-api.sh