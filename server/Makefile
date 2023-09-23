default:
	@echo "Please specify a target to make."

build-ui:
	@echo "Building UI..."
	cd ../frontend && bun run build

reset-folder:
	rm -rf wwwroot
	mkdir wwwroot

run: reset-folder build-ui
	@echo "Building UI..."
	dotnet run .

docker: reset-folder build-ui
	@echo "Docker build..."
	cp -r ../frontend/dist/* wwwroot
	#dotnet publish --os linux --arch x64 /t:PublishContainer -c Release
	#docker login
	docker build . -t am8850/sksummarizer:dev
	docker push am8850/sksummarizer:dev

docker-run: docker
	docker run --rm -p 8080:80 --env-file=.env am8850/sksummarizer:dev