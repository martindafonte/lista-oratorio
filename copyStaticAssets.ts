import * as shell from "shelljs";

shell.mkdir("dist/public")
shell.cp("-R", "public/js", "dist/public/js/");
shell.cp("-R", "public/css", "dist/public/css");
shell.cp("-R", "views", "dist/views/");
